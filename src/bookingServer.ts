import express, { Request, Response } from "express";
import { Server } from "socket.io";
import http from "http";
import prisma from "./lib/prisma";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is required");
}
const redis = new Redis(REDIS_URL);

app.use(express.json());

const queueKey = "eventQueue";
let rankings: { userId: string; eventId: string }[] = [];
let queueFrozen = false;
let lastFirstUser: { userId: string; eventId: string } | null = null;

type BookRequest = Request<{}, {}, { userId: string; eventId: string }>;
type PaymentRequest = Request<{}, {}, { userId: string; eventId: string }>;

type ScoreEntry = {
  id: string;
  artistId: string;
  userId: string;
  score: number;
};

const calculateScore = async (userId: string, eventId: string): Promise<number> => {
  const userScores: ScoreEntry[] = await prisma.score.findMany({ where: { userId } });
  return userScores.reduce((sum, entry) => sum + entry.score, 0);
};

setInterval(async () => {
  if (!queueFrozen) {
    rankings = await prisma.userEvent.findMany({
      include: { user: { include: { scores: true } } },
    });
    rankings.sort(
      (a, b) =>
        // @ts-ignore
        b.user.scores.reduce((sum, s) => sum + s.score, 0) -
        // @ts-ignore
        a.user.scores.reduce((sum, s) => sum + s.score, 0)
    );
    queueFrozen = true;
    if (rankings.length > 0) {
      const newFirstUser = rankings[0];
      if (!lastFirstUser || lastFirstUser.userId !== newFirstUser.userId) {
        lastFirstUser = newFirstUser;
        io.emit("firstUserUpdate", {
          userId: newFirstUser.userId,
          eventId: newFirstUser.eventId,
        });
      }
    }
  }
}, 5 * 60 * 1000);

app.post("/book", async (req: BookRequest, res: Response) => {
  const { userId, eventId } = req.body;
  try {
    await prisma.userEvent.create({ data: { userId, eventId } });
    const score = await calculateScore(userId, eventId);
    await redis.zadd(queueKey, score, JSON.stringify({ userId, eventId }));
    const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");
    io.emit("queueUpdate", queue);
    res.json({ message: "User added to queue", queue });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post("/payment-success", async (req: PaymentRequest, res: Response) => {
  const { userId, eventId } = req.body;
  const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");
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

io.on("connection", async (socket : any) => {
  const queue = await redis.zrevrange(queueKey, 0, -1, "WITHSCORES");
  socket.emit("queueUpdate", queue);
  socket.on("disconnect", () => {});
});

server.listen(3000, () => console.log("Server running on port 3000"));
