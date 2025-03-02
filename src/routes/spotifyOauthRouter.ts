import express, { Request, Response } from "express";
import axios from "axios";
import querystring from "querystring";
import requireAuth from "../middleware/auth";
import prisma from "../lib/prisma";

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/api/spotify/callback";
const FRONTEND_URI = "http://localhost:5173";

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

    const { access_token, refresh_token } = response.data;

    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: "Bearer " + access_token },
    });

    await prisma.user.update({
      where: { username: username },
      data: {
        spotifyId: userResponse.data.id,
      },
    });

    await prisma.spotify.upsert({
      where: { spotifyId: userResponse.data.id },
      update: {
        name: userResponse.data.display_name,
        image: userResponse.data.images[0].url,
      },
      create: {
        name: userResponse.data.display_name,
        image: userResponse.data.images[0].url,
        user: { connect: { username: username } },
      },
    });

    res.redirect(`${FRONTEND_URI}/artist`);
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

    // First, fetch the user to get their spotifyId
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
        spotifyId: "",
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
