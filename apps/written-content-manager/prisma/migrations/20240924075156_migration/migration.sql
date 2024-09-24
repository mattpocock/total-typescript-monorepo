-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('COURSE_CREATED', 'SECTION_CREATED', 'EXERCISE_CREATED', 'EXERCISE_MARKED_READY_FOR_RECORDING');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);
