/*
  Warnings:

  - The values [HIGH,MEDIUM,LOW] on the enum `DemandLevel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `quizScore` on the `Assessment` table. All the data in the column will be lost.
  - The `questions` column on the `Assessment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `salaryRanges` column on the `IndustryInsight` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `feedback` on the `Resume` table. All the data in the column will be lost.
  - Added the required column `quizeScore` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `marketOutlook` on the `IndustryInsight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MarketOutLook" AS ENUM ('Positive', 'Neutral', 'Negative');

-- AlterEnum
BEGIN;
CREATE TYPE "DemandLevel_new" AS ENUM ('High', 'Medium', 'Low');
ALTER TABLE "IndustryInsight" ALTER COLUMN "demandLevel" TYPE "DemandLevel_new" USING ("demandLevel"::text::"DemandLevel_new");
ALTER TYPE "DemandLevel" RENAME TO "DemandLevel_old";
ALTER TYPE "DemandLevel_new" RENAME TO "DemandLevel";
DROP TYPE "DemandLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "quizScore",
ADD COLUMN     "quizeScore" DOUBLE PRECISION NOT NULL,
DROP COLUMN "questions",
ADD COLUMN     "questions" JSONB[];

-- AlterTable
ALTER TABLE "IndustryInsight" DROP COLUMN "salaryRanges",
ADD COLUMN     "salaryRanges" JSONB[],
DROP COLUMN "marketOutlook",
ADD COLUMN     "marketOutlook" "MarketOutLook" NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "feedback",
ADD COLUMN     "feedBack" TEXT;

-- DropEnum
DROP TYPE "MarketOutlook";
