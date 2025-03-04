/*
  Warnings:

  - Added the required column `concertName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "concertName" TEXT NOT NULL,
ADD COLUMN     "description" JSONB NOT NULL;
