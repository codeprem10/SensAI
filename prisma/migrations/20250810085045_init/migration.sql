/*
  Warnings:

  - You are about to drop the column `score` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `industryInsightId` on the `User` table. All the data in the column will be lost.
  - Added the required column `category` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questions` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizScore` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `CoverLetter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `CoverLetter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CoverLetter` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `salaryRanges` on the `IndustryInsight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `marketOutlook` on the `IndustryInsight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `atsScore` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MarketOutlook" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_industryInsightId_fkey";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "score",
DROP COLUMN "title",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "improvementTip" TEXT,
ADD COLUMN     "questions" JSONB NOT NULL,
ADD COLUMN     "quizScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CoverLetter" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "jobDescription" TEXT,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "IndustryInsight" DROP COLUMN "salaryRanges",
ADD COLUMN     "salaryRanges" JSONB NOT NULL,
DROP COLUMN "marketOutlook",
ADD COLUMN     "marketOutlook" "MarketOutlook" NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "fileUrl",
ADD COLUMN     "atsScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "industryInsightId",
ADD COLUMN     "industry" TEXT;

-- DropEnum
DROP TYPE "MarketOutLook";

-- CreateIndex
CREATE INDEX "Assessment_userId_idx" ON "Assessment"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_industry_fkey" FOREIGN KEY ("industry") REFERENCES "IndustryInsight"("industry") ON DELETE SET NULL ON UPDATE CASCADE;
