-- AlterTable
ALTER TABLE "Concept" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ContentWorkflowRunToConcept" (
    "runId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentWorkflowRunToConcept_pkey" PRIMARY KEY ("runId","conceptId")
);

-- AddForeignKey
ALTER TABLE "ContentWorkflowRunToConcept" ADD CONSTRAINT "ContentWorkflowRunToConcept_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ContentWorkflowRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentWorkflowRunToConcept" ADD CONSTRAINT "ContentWorkflowRunToConcept_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
