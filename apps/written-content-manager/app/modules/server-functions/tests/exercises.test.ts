import { describe, expect, it } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";

describe("exercises", () => {
  describe("create", () => {
    it("Should let you create an exercise", async () => {
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

      const sectionInDb = await serverFunctions.sections.get({
        id: section.id,
      });

      expect(sectionInDb.exercises).toMatchObject([
        {
          id: exercise.id,
          title: "abc",
        },
      ]);
    });

    it("Should log it in analytics", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const analytics = await serverFunctions.analytics.allCounts();

      expect(analytics.exercisesCreatedToday).toEqual(1);
    });
  });
  describe("moveSection", async () => {
    it("Should move the exercise from one section to another", async () => {
      const course = await p.course.create({
        data: {
          title: "abc",
          type: "WORKSHOP",
        },
      });

      const section1 = await p.section.create({
        data: {
          courseId: course.id,
          order: 0,
          title: "abc",
        },
      });

      const section2 = await p.section.create({
        data: {
          courseId: course.id,
          order: 0,
          title: "abc",
        },
      });

      const exercise = await p.exercise.create({
        data: {
          order: 0,
          title: "abc",
          sectionId: section1.id,
        },
      });

      await serverFunctions.exercises.moveSection({
        exerciseId: exercise.id,
        sectionId: section2.id,
      });

      expect(
        await p.exercise.findFirstOrThrow({ where: { id: exercise.id } })
      ).toMatchObject({
        id: exercise.id,
        sectionId: section2.id,
      });
    });
  });
});
