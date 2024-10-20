-- AlterEnum
ALTER TYPE "AnalyticsEventType" ADD VALUE 'EXERCISE_VIDEO_RECORDING_MARKED_AS_FINAL';

-- CreateTable
CREATE TABLE "ExerciseVideoTake" (
    "id" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseVideoTake_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseVideoTake" ADD CONSTRAINT "ExerciseVideoTake_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
