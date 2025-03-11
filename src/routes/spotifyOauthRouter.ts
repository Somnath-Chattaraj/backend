import express, { Request, Response } from "express";
import axios from "axios";
import querystring from "querystring";
import requireAuth from "../middleware/auth";
import prisma from "../lib/prisma";

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.BACKEND_URI}/api/spotify/callback`;
const FRONTEND_URI = process.env.FRONTEND_URI;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing required environment variables: SPOTIFY_CLIENT_ID and/or SPOTIFY_CLIENT_SECRET"
  );
}

router.get("/login", requireAuth, (req: Request, res: Response) => {
  if (!CLIENT_ID) {
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const scope = "user-read-private user-read-email user-top-read";
  res.json({
    authUrl:
      "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
      }),
  });
});

router.get("/callback", requireAuth, async (req: Request, res: Response) => {
  const code = (req.query.code as string) || null;

  //@ts-ignore
  const username = req.user.username;

  if (!code) {
    return res.redirect(`${FRONTEND_URI}?error=invalid_code`);
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.redirect(`${FRONTEND_URI}?error=server_configuration_error`);
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log(response.data);

    let userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: "Bearer " + access_token },
    });

    await prisma.user.update({
      where: { username: username },
      data: {
        spotifyId: userResponse.data.id,
      },
    });
    if (!userResponse.data.images || userResponse.data.images.length === 0) {
      userResponse.data.images = [];
      userResponse.data.images[0] = {};
      userResponse.data.images[0].url =
        "https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-profile-user-png.png";
    }
    await prisma.spotify.upsert({
      where: { spotifyId: userResponse.data.id },
      update: {
        name: userResponse.data.display_name,
        image: userResponse.data.images[0].url,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
      },
      create: {
        name: userResponse.data.display_name,
        image: userResponse.data.images[0].url,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        user: { connect: { username: username } },
      },
    });

    res.redirect(`${FRONTEND_URI}/spotify`);
  } catch (error) {
    console.error("Error in Spotify callback:", error);
    res.redirect(`${FRONTEND_URI}?error=spotify_callback_error`);
  }
});

router.get("/user", requireAuth, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const username = req.user.username;

    const user = await prisma.user.findUnique({
      where: { username },
      include: { spotify: true },
    });

    if (!user || !user.spotify) {
      res.status(404).json({ error: "Spotify profile not found" });
      return;
    }

    res.json(user.spotify);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/disconnect", requireAuth, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const username = req.user.username;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { spotifyId: true },
    });

    if (!user || !user.spotifyId) {
      res.status(404).json({ error: "No Spotify account connected" });
      return;
    }
    const spotifyId = user.spotifyId;

    try {
      await prisma.spotify.delete({
        where: { spotifyId },
      });
    } catch (err) {
      console.error("Error deleting Spotify profile:", err);
    }

    await prisma.user.update({
      where: { username },
      data: {
        spotifyId: null,
      },
    });

    res.json({ message: "Spotify account disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting Spotify account:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as any)?.message || String(error),
    });
  }
});

export default router;
