import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

// @ts-ignore
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
    const {name,liveAt,artistName} = req.body;
    if (!name || !liveAt || !artistName) {
        return res.status(400).json({message: "Name and liveAt is required"});
    }
    let ongoin : boolean = false;
    if (liveAt > Date.now()) {
        ongoin = true;
    }
    const event = await prisma.event.create({
        data: {
            name: name,
            ongoing: ongoin,
            liveAt: liveAt,
            artistName,
        },
    })

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

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await prisma.event.findMany({
        where: {
            OR: [
                {
                    ongoing: true,
                },
                {
                    upcoming: true,
                }
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