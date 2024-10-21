/*
  Warnings:

  - You are about to drop the column `lastPrintedAt` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "lastPrintedAt",
ADD COLUMN     "lastPrintedToRepoAt" TIMESTAMP(3);
