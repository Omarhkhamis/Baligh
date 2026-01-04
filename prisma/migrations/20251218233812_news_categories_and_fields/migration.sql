/*
  Warnings:

  - Added the required column `summary` to the `NewsArticle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NewsCategory" ADD VALUE 'TRAINING';
ALTER TYPE "NewsCategory" ADD VALUE 'EVENT';
ALTER TYPE "NewsCategory" ADD VALUE 'ACHIEVEMENT';
ALTER TYPE "NewsCategory" ADD VALUE 'STATEMENT';

-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "summary" JSON NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoUrl" TEXT;
