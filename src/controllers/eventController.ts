import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

// @ts-ignore
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { name, liveAt, artistName, concertName, description } = req.body;
  if (!name || !liveAt || !artistName || !description || !concertName) {
    return res.status(400).json({ message: "Name and liveAt is required" });
  }
  let ongoin: boolean = false;
  if (liveAt > Date.now()) {
    ongoin = true;
  }
  const event = await prisma.event.create({
    data: {
      name: name,
      ongoing: ongoin,
      liveAt: liveAt,
      artistName,
      concertName,
      description,
    },
  });

  res.status(201).json({
    message: "Event created successfully",
    event: {
      id: event.id,
      name: event.name,
      ongoing: event.ongoing,
      liveAt: event.liveAt,
    },
  });
});

export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await prisma.event.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      ongoing: true,
      liveAt: true,
      artistName: true,
      concertName: true,
      description: true,
    },
  });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.json(event);
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        {
          ongoing: true,
        },
        {
          upcoming: true,
        },
      ],
    },
    select: {
      id: true,
      name: true,
      ongoing: true,
      liveAt: true,
    },
  });
});
