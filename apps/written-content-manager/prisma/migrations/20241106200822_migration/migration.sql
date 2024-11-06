-- AlterTable
ALTER TABLE "ContentWorkflow" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ContentWorkflowRun" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ContentWorkflowStep" ADD COLUMN     "deletedAt" TIMESTAMP(3);
