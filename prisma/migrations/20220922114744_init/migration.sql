/*
  Warnings:

  - Added the required column `repeat` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "custom_repeat" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "repeat" TEXT NOT NULL;
