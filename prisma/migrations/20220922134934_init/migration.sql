/*
  Warnings:

  - You are about to drop the column `custom_repeat` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `repeat` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `isRepeated` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repeat_pattern` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "custom_repeat",
DROP COLUMN "repeat",
ADD COLUMN     "isRepeated" BOOLEAN NOT NULL,
ADD COLUMN     "repeat_custom_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "repeat_pattern" TEXT NOT NULL;
