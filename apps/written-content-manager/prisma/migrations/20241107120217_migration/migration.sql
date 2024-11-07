/*
  Warnings:

  - You are about to drop the `ContentWorkflowRunToConcept` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentWorkflowRunToConcept" DROP CONSTRAINT "ContentWorkflowRunToConcept_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "ContentWorkflowRunToConcept" DROP CONSTRAINT "ContentWorkflowRunToConcept_runId_fkey";

-- AlterTable
ALTER TABLE "ContentWorkflowRun" ADD COLUMN     "conceptId" TEXT;

-- DropTable
DROP TABLE "ContentWorkflowRunToConcept";

-- AddForeignKey
ALTER TABLE "ContentWorkflowRun" ADD CONSTRAINT "ContentWorkflowRun_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE SET NULL ON UPDATE CASCADE;
