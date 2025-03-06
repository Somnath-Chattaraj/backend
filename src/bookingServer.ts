import express, { Request, Response } from "express";
import { Server } from "socket.io";
import http from "http";
import prisma from "./lib/prisma";
import dotenv from "dotenv";
import Redis from "ioredis";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";
import { SpotifyTopTracksResponse } from "./types/spotify";
// import querystring from "querystring";
import requireAuth from "./middleware/auth";
import { refreshSpotifyToken } from "./controllers/spotifyController";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", credentials: true } });

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is required");
}
const redis = new Redis(REDIS_URL);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow cookies if needed
  })
);

const queueKey = "eventQueue";
let rankings: { userId: string; eventId: string }[] = [];
let queueFrozen = false;
let lastFirstUser: { userId: string; eventId: string } | null = null;

type BookRequest = Request<
  {},
  {},
  { userId: string; eventId: string; artistName: string }
>;
type PaymentRequest = Request<
  {},
  {},
  { userId: string; eventId: string; ticketId: string }
>;

async function calculateScore(spotifyUserId: string, artistName: string) {
  if (!spotifyUserId || !artistName) {
    throw new Error("Spotify user ID and artist name are required");
  }

  const spotifyData = await prisma.spotify.findUnique({
    where: { spotifyId: spotifyUserId },
  });

  if (!spotifyData) {
    throw new Error("Spotify data not found for user");
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
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const response2 = await axios.get<SpotifyTopTracksResponse>(
    "https://api.spotify.com/v1/me/top/tracks",
    {
      params: { limit: 50, time_range: "long_term", offset: 50 },
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  response.data.items = response.data.items.concat(response2.data.items);

  const topTracks = response.data.items;
  if (!topTracks || topTracks.length === 0) {
    throw new Error("No tracks found for user");
  }

  const artistTrackCount = topTracks.filter((track) =>
    track.artists.some(
      (artist) => artist.name.toLowerCase() === artistName.toLowerCase()
    )
  ).length;

  const percentage = (artistTrackCount / topTracks.length) * 100;
  const score = Math.round(percentage * 100) + 5000;

  return { score, percentage, artistTrackCount, totalTracks: topTracks.length };
}

const manageQueue = async () => {
  try {
    const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");

    if (queue.length > 0) {
      const firstEntry = JSON.parse(queue[0]);
      const userEvent = await prisma.userEvent.findUnique({
        where: {
          userId_eventId: {
            userId: firstEntry.userId,
            eventId: firstEntry.eventId,
          },
        },
        include: {
          user: true,
          event: true,
        },
      });

      if (userEvent) {
        // const score = await calculateScore(
        //   userEvent.user.spotifyId!,
        //   userEvent.event.artistName
        // );

        // console.log("First User Details:", {
        //   userId: userEvent.userId,
        //   eventId: userEvent.eventId,
        //   score: score.score,
        // });

        if (!lastFirstUser || lastFirstUser.userId !== userEvent.userId) {
          lastFirstUser = {
            userId: userEvent.userId,
            eventId: userEvent.eventId,
          };

          io.emit("firstUserUpdate", {
            userId: userEvent.userId,
            eventId: userEvent.eventId,
          });
          setTimeout(async () => {
            await redis.zrem(
              queueKey,
              JSON.stringify({
                userId: userEvent.userId,
                eventId: userEvent.eventId,
              })
            );
            await prisma.userEvent.delete({
              where: {
                userId_eventId: {
                  userId: userEvent.userId,
                  eventId: userEvent.eventId,
                },
              },
            });

            const updatedQueue = await redis.zrevrange(
              queueKey,
              0,
              -1,
              "WITHSCORES"
            );
            io.emit("queueUpdate", updatedQueue);
          }, 60000);
        }
      }
    }
  } catch (error) {
    console.error("Error managing queue:", error);
  }
};

setInterval(manageQueue, 30*1000);
type MockBookRequest = Request<
  {},
  {},
  { userId: string; eventId: string; score: number }
>;
app.post("/api/mock-book", async (req: MockBookRequest, res: Response) => {
  const { userId, eventId, score } = req.body;

  try {
    const existingEntry = await prisma.userEvent.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingEntry) {
      res.status(200).json({ message: "User has already booked tickets" });
      return;
    }

    await prisma.userEvent.create({ data: { userId, eventId } });
    await redis.zadd(
      queueKey,
      score,
      JSON.stringify({ userId, eventId })
    );
    const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");

    io.emit("queueUpdate", queue);

    res.json({ message: "Mock user added to queue", queue });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post("/api/book", requireAuth, async (req: BookRequest, res: Response) => {
  const { eventId, artistName } = req.body;
  //@ts-ignore
  const user = req.user;
  const userId = user.id;
  const spotifyId = user.spotifyId;

  try {
    const existingEntry = await prisma.userEvent.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingEntry) {
      res.status(200).json({ message: "User has already booked tickets" });
      return;
    }

    await prisma.userEvent.create({ data: { userId, eventId } });
    const score = await calculateScore(spotifyId, artistName);
    await redis.zadd(
      queueKey,
      score.score,
      JSON.stringify({ userId, eventId })
    );
    const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");

    io.emit("queueUpdate", queue);

    res.json({ message: "User added to queue", queue });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// ✅ Root Route
app.get("/", async (req: Request, res: Response) => {
  res.send("Hello World");
});

// ✅ Payment Route
app.post("/api/payment-success", async (req: PaymentRequest, res: Response) => {
  const { userId, eventId, ticketId } = req.body;
  const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");
  await prisma.tickets.create({
    data: {
      userId,
      eventId,
      ticketId,
    },
  });

  if (queue.length) {
    const frontUser = JSON.parse(queue[0]);
    if (frontUser.userId === userId && frontUser.eventId === eventId) {
      await redis.zrem(queueKey, queue[0]);
      const updatedQueue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");
      io.emit("queueUpdate", updatedQueue);
      if (updatedQueue.length > 0) {
        const newFirstUser = JSON.parse(updatedQueue[0]);
        io.emit("firstUserUpdate", {
          userId: newFirstUser.userId,
          eventId: newFirstUser.eventId,
        });
      }
      res.json({ message: "Payment successful, user removed from queue" });
    } else {
      res.status(400).json({ error: "User is not at the front of the queue" });
    }
  } else {
    res.status(400).json({ error: "Queue is empty" });
  }
});

io.on("connection", async (socket) => {
  const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");
  socket.emit("queueUpdate", queue);
  socket.on("disconnect", () => {});
});

// ✅ Start Server
server.listen(3001, () => console.log("Server running on port 3001"));
