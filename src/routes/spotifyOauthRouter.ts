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

// Check for required environment variables
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

    res.redirect(`${FRONTEND_URI}/artist`);
  } catch (error) {
    console.error("Error in Spotify callback:", error);
    res.redirect(`${FRONTEND_URI}?error=spotify_callback_error`);
  }
});

export default router;
