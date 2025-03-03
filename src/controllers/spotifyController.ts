import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import axios from "axios";
import querystring from "querystring";
import { SpotifyTopTracksResponse } from "../types/spotify";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export const getScore = asyncHandler(async (req: Request, res: Response) => {
  const { artistName } = req.body;
  //@ts-ignore
  const spotifyUserId = req.user.spotifyId;

  if (!spotifyUserId || !artistName) {
    res
      .status(400)
      .json({ message: "Spotify user ID and artist name are required" });
    return;
  }

  try {
    const spotifyData = await prisma.spotify.findUnique({
      where: { spotifyId: spotifyUserId },
    });

    if (!spotifyData) {
      res.status(404).json({ message: "Spotify data not found for user" });
      return;
    }

    let accessToken = spotifyData.accessToken;

    if (new Date() > spotifyData.tokenExpiry) {
      const refreshedData = await refreshSpotifyToken(spotifyData.refreshToken);
      accessToken = refreshedData.access_token;

      await prisma.spotify.update({
        where: { spotifyId: spotifyUserId },
        data: {
          accessToken: refreshedData.access_token,
          tokenExpiry: new Date(Date.now() + refreshedData.expires_in * 1000),
        },
      });
    }

    let response = await axios.get<SpotifyTopTracksResponse>(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        params: { limit: 50, time_range: "long_term" },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const response2 = await axios.get<SpotifyTopTracksResponse>(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        params: { limit: 50, time_range: "long_term", offset: 50 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    response.data.items = response.data.items.concat(response2.data.items);

    const topTracks = response.data.items;
    console.log(topTracks);

    if (!topTracks || topTracks.length === 0) {
      res.status(404).json({ message: "No tracks found for user" });
      return;
    }

    const artistTrackCount = topTracks.filter((track) =>
      track.artists.some(
        (artist) => artist.name.toLowerCase() === artistName.toLowerCase()
      )
    ).length;

    const percentage = (artistTrackCount / topTracks.length) * 100;
    const score = Math.round(percentage * 100) + 5000;

    res.json({
      score,
      percentage,
      artistTrackCount,
      totalTracks: topTracks.length,
    });
  } catch (error: any) {
    console.error(
      "Error fetching Spotify data:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      res.status(401).json({ message: "Invalid or expired access token" });
      return;
    }

    res.status(500).json({
      message: "Error fetching Spotify data",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

export async function refreshSpotifyToken(refreshToken: string) {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
}
