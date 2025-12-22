/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "lastLoggedId" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiry" TIMESTAMP(3),
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;
