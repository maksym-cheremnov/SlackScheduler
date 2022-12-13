/*
  Warnings:

  - You are about to drop the column `channels` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `users` on the `Job` table. All the data in the column will be lost.
  - Added the required column `user` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "channels",
DROP COLUMN "sender",
DROP COLUMN "users",
ADD COLUMN     "user" TEXT NOT NULL;
