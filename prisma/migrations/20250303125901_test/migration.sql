/*
  Warnings:

  - A unique constraint covering the columns `[spotifyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "spotifyId" TEXT;

-- CreateTable
CREATE TABLE "Spotify" (
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spotify_pkey" PRIMARY KEY ("spotifyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyId_key" ON "User"("spotifyId");

-- AddForeignKey
ALTER TABLE "Spotify" ADD CONSTRAINT "Spotify_spotifyId_fkey" FOREIGN KEY ("spotifyId") REFERENCES "User"("spotifyId") ON DELETE CASCADE ON UPDATE CASCADE;
