/*
  Warnings:

  - The primary key for the `ContentWorkflowRunStep` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ContentWorkflowRunStep` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContentWorkflowRunStep" DROP CONSTRAINT "ContentWorkflowRunStep_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ContentWorkflowRunStep_pkey" PRIMARY KEY ("runId", "stepId");
