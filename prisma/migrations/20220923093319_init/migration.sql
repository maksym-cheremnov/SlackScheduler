/*
  Warnings:

  - Added the required column `repeat_end_date` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "repeat_end_date" TEXT NOT NULL;
