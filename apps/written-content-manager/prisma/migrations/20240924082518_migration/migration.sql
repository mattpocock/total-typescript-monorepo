/*
  Warnings:

  - You are about to drop the column `type` on the `Exercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ExerciseType";
