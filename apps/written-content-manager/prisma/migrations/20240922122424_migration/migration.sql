/*
  Warnings:

  - You are about to drop the column `slug` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "slug",
ADD COLUMN     "repoSlug" TEXT;
