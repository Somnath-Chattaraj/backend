import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import axios from "axios";

interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
}

interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
}

export const getScore = asyncHandler(async (req: Request, res: Response) => {
  const { spotifyUserId, artistName, accessToken } = req.body;

  if (!spotifyUserId || !artistName) {
    res
      .status(400)
      .json({ message: "Spotify user ID and artist name are required" });
    return;
  }

  if (!accessToken) {
    res.status(401).json({ message: "Access token is required" });
    return;
  }

  try {
    // Fetch the user's top tracks from Spotify API
    const response = await axios.get<SpotifyTopTracksResponse>(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        params: { limit: 50, time_range: "medium_term" },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const topTracks = response.data.items;

    if (!topTracks || topTracks.length === 0) {
      res.status(404).json({ message: "No tracks found for user" });
      return;
    }

    // Count the number of tracks by the specified artist
    const artistTrackCount = topTracks.filter((track) =>
      track.artists.some(
        (artist) => artist.name.toLowerCase() === artistName.toLowerCase()
      )
    ).length;

    // Calculate the percentage and score
    const percentage = (artistTrackCount / topTracks.length) * 100;
    const score = Math.round(percentage * 10) + 5000;

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

    // Handle specific Spotify API errors
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
