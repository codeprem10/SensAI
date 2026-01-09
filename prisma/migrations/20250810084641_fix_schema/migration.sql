/*
  Warnings:

  - The values [POSITIVE,NEUTRAL,NEGATIVE] on the enum `MarketOutLook` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `improvementTip` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `questions` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `quizeScore` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `CoverLetter` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `CoverLetter` table. All the data in the column will be lost.
  - You are about to drop the column `jobDescription` on the `CoverLetter` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `CoverLetter` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CoverLetter` table. All the data in the column will be lost.
  - You are about to drop the column `atsScore` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `feedBack` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `User` table. All the data in the column will be lost.
  - Added the required column `score` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MarketOutLook_new" AS ENUM ('DECLINING', 'STABLE', 'GROWING');
ALTER TABLE "IndustryInsight" ALTER COLUMN "marketOutlook" TYPE "MarketOutLook_new" USING ("marketOutlook"::text::"MarketOutLook_new");
ALTER TYPE "MarketOutLook" RENAME TO "MarketOutLook_old";
ALTER TYPE "MarketOutLook_new" RENAME TO "MarketOutLook";
DROP TYPE "MarketOutLook_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_industry_fkey";

-- DropIndex
DROP INDEX "Assessment_userId_idx";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "category",
DROP COLUMN "improvementTip",
DROP COLUMN "questions",
DROP COLUMN "quizeScore",
DROP COLUMN "updatedAt",
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CoverLetter" DROP COLUMN "companyName",
DROP COLUMN "createdAt",
DROP COLUMN "jobDescription",
DROP COLUMN "jobTitle",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "atsScore",
DROP COLUMN "content",
DROP COLUMN "createdAt",
DROP COLUMN "feedBack",
DROP COLUMN "updatedAt",
ADD COLUMN     "fileUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "industry",
ADD COLUMN     "industryInsightId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_industryInsightId_fkey" FOREIGN KEY ("industryInsightId") REFERENCES "IndustryInsight"("id") ON DELETE SET NULL ON UPDATE CASCADE;
