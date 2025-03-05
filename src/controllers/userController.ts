import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (user) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    const userCreated = await prisma.user.create({
      data: {
        username: username,
      },
    });

    const exp = Date.now() + 1000 * 60 * 60 * 5;
    const token = jwt.sign({ sub: userCreated.id, exp }, process.env.SECRET!);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: userCreated.id,
        username: userCreated.username,
      },
    });
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;

  let user = await prisma.user.findFirst({
    where: {
      username: username,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: username,
      },
    });
  }

  const exp = Date.now() + 1000 * 60 * 60 * 5;
  const token = jwt.sign({ sub: user.id, exp }, process.env.SECRET!);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  //@ts-ignore
  const user = req.user;

  res.status(200).json({ user });
});

export const logOut = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token", { httpOnly: true, secure: true });

  res.json({ message: "Logged out successfully" });
});

export const signout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token", { path: "/", httpOnly: true, secure: true });

  res.json({ message: "Signed out successfully" });
});
