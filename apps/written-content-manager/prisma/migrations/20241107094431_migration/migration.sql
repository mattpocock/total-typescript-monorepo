/*
  Warnings:

  - You are about to drop the column `content` on the `ContentWorkflowRunStep` table. All the data in the column will be lost.
  - Added the required column `output` to the `ContentWorkflowRunStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContentWorkflowRunStep" DROP COLUMN "content",
ADD COLUMN     "input" TEXT,
ADD COLUMN     "output" TEXT NOT NULL;
