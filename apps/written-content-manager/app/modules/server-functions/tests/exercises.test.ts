import { describe, expect, it, vitest } from "vitest";
import { p } from "../../../db";
import { serverFunctions } from "../server-functions";
import { createTmpDir } from "./test-utils";
import { fs } from "~/fs";

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

  describe("get", () => {
    it("Should return the exercise", async () => {
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

      expect(
        await serverFunctions.exercises.get({
          id: exercise.id,
        })
      ).toMatchObject({
        id: exercise.id,
        title: "abc",
      });
    });

    it("Should return any associated files", async () => {
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

      vitest.spyOn(fs, "openInVSCode").mockResolvedValue();

      await serverFunctions.exercises.createExplainerFile({
        id: exercise.id,
      });

      expect(
        await serverFunctions.exercises
          .get({ id: exercise.id })
          .then((exercise) => exercise.files)
      ).toHaveLength(1);
    });
  });

  describe("createExplainerFile", () => {
    it("Should create an explainer file for the exercise", async () => {
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

      vitest.spyOn(fs, "openInVSCode").mockResolvedValue();

      await serverFunctions.exercises.createExplainerFile({
        id: exercise.id,
      });

      expect(
        await serverFunctions.exercises
          .get({ id: exercise.id })
          .then((exercise) => exercise.files)
      ).toHaveLength(1);
    });

    it("Should throw an error if an explainer file already exists", async () => {
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

      vitest.spyOn(fs, "openInVSCode").mockResolvedValue();

      await serverFunctions.exercises.createExplainerFile({
        id: exercise.id,
      });

      await expect(
        serverFunctions.exercises.createExplainerFile({
          id: exercise.id,
        })
      ).rejects.toThrow("Explainer file already exists");
    });
  });

  describe("getPrevExercise", () => {
    it("Should return the previous exercise", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise1 = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const exercise2 = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      expect(
        await serverFunctions.exercises.getPrevExercise({
          id: exercise2.id,
        })
      ).toMatchObject({
        id: exercise1.id,
      });
    });

    it("Should get the last exercise of the previous section if no previous exercise exists", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section1 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const section2 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise1 = await serverFunctions.exercises.create({
        sectionId: section1.id,
        title: "abc",
      });

      const exercise2 = await serverFunctions.exercises.create({
        sectionId: section2.id,
        title: "abc",
      });

      expect(
        await serverFunctions.exercises.getPrevExercise({
          id: exercise2.id,
        })
      ).toMatchObject({
        id: exercise1.id,
      });
    });

    it("Should return null if there is no previous exercise", async () => {
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

      expect(
        await serverFunctions.exercises.getPrevExercise({
          id: exercise.id,
        })
      ).toBeNull();
    });
  });

  describe("getNextExercise", () => {
    it("Should return the next exercise", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise1 = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      const exercise2 = await serverFunctions.exercises.create({
        sectionId: section.id,
        title: "abc",
      });

      expect(
        await serverFunctions.exercises.getNextExercise({
          id: exercise1.id,
        })
      ).toMatchObject({
        id: exercise2.id,
      });
    });

    it("Should get the first exercise of the next section if no next exercise exists", async () => {
      const course = await serverFunctions.courses.create({
        title: "abc",
      });

      const section1 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const section2 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "abc",
      });

      const exercise1 = await serverFunctions.exercises.create({
        sectionId: section1.id,
        title: "abc",
      });

      const exercise2 = await serverFunctions.exercises.create({
        sectionId: section2.id,
        title: "abc",
      });

      expect(
        await serverFunctions.exercises.getNextExercise({
          id: exercise1.id,
        })
      ).toMatchObject({
        id: exercise2.id,
      });
    });

    it("Should return null if there is no next exercise", async () => {
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

      expect(
        await serverFunctions.exercises.getNextExercise({
          id: exercise.id,
        })
      ).toBeNull();
    });
  });
});
