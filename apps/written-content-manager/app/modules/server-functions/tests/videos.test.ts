import { describe, expect, it } from "vitest";
import { serverFunctions } from "../server-functions";

describe("videos", () => {
  describe("listTakes", () => {
    it("Should list the videos for an exercise", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      const videos = await serverFunctions.videos.listTakes({
        exerciseId: exercise.id,
      });

      expect(videos).toMatchObject([
        {
          uri: "/example.mp4",
        },
      ]);
    });

    it("Should list videos in update/create order, with final ones at the start", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const take1 = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      const take2 = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      const take3 = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      expect(
        await serverFunctions.videos.listTakes({
          exerciseId: exercise.id,
        })
      ).toMatchObject([
        {
          id: take3.id,
        },
        {
          id: take2.id,
        },
        {
          id: take1.id,
        },
      ]);

      await serverFunctions.videos.markTakeAsFinal({
        id: take1.id,
      });

      expect(
        await serverFunctions.videos.listTakes({
          exerciseId: exercise.id,
        })
      ).toMatchObject([
        {
          id: take1.id,
        },
        {
          id: take3.id,
        },
        {
          id: take2.id,
        },
      ]);
    });
  });

  describe("handleUploadedTake", () => {
    it("Should create a take", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      const videos = await serverFunctions.videos.listTakes({
        exerciseId: exercise.id,
      });

      expect(videos).toMatchObject([
        {
          uri: "/example.mp4",
        },
      ]);
    });
  });
  describe("deleteTake", () => {
    it("Should delete a take and remove the file from the file system", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const take = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      await serverFunctions.videos.deleteTake({
        id: take.id,
      });

      const videos = await serverFunctions.videos.listTakes({
        exerciseId: exercise.id,
      });

      expect(videos).toHaveLength(0);
    });
  });

  describe("markTakeAsFinal", () => {
    it("Should mark the take as final", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const take = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      await serverFunctions.videos.markTakeAsFinal({
        id: take.id,
      });

      const takes = await serverFunctions.videos.listTakes({
        exerciseId: exercise.id,
      });

      expect(takes).toMatchObject([
        {
          id: take.id,
          isFinal: true,
        },
      ]);
    });

    it("Should mark other takes as not final", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const take1 = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      await serverFunctions.videos.markTakeAsFinal({
        id: take1.id,
      });

      const take2 = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      await serverFunctions.videos.markTakeAsFinal({
        id: take2.id,
      });

      const takes = await serverFunctions.videos.listTakes({
        exerciseId: exercise.id,
      });

      expect(takes).toMatchObject([
        // Final takes should come first
        {
          id: take2.id,
          isFinal: true,
        },
        {
          id: take1.id,
          isFinal: false,
        },
      ]);
    });

    it("Should create an analytics event", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const take1 = await serverFunctions.videos.handleUploadedTake({
        exerciseId: exercise.id,
        uri: "/example.mp4",
      });

      await serverFunctions.videos.markTakeAsFinal({
        id: take1.id,
      });

      const analytics = await serverFunctions.analytics.allCounts();

      expect(analytics.exerciseVideoRecordingsMarkedAsFinal).toEqual(1);
    });
  });
});
