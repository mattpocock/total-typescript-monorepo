import { describe, expect, it } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";

describe("exercises", () => {
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
