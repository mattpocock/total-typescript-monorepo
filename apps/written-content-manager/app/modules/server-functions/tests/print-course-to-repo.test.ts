import { describe, expect, it } from "vitest";
import { serverFunctions } from "../server-functions";
import { printCourseToRepo } from "../print-course-to-repo";
import { mockFS } from "~/fs";
import path from "path";
import { TOTAL_TYPESCRIPT_REPOS_FOLDER } from "@total-typescript/shared";

describe("print-course-to-repo", () => {
  it("Should fail if the course does not have a repo slug", async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
    });

    await expect(
      printCourseToRepo({
        id: course.id,
      })
    ).rejects.toThrow("Course does not have a repo slug");
  });

  it("Should fail if the course repo does not exist", async () => {
    await mockFS(async (fs) => {
      const course = await serverFunctions.courses.create({
        title: "My tRPC Course",
        repoSlug: "my-trpc-course",
      });

      await expect(
        printCourseToRepo({
          id: course.id,
        })
      ).rejects.toThrow("Course repo does not exist");
    });
  });

  it('Should delete the "src" folder in the course repo', async () => {
    await mockFS(async (fs) => {
      const course = await serverFunctions.courses.create({
        title: "My tRPC Course",
        repoSlug: "my-trpc-course",
      });

      const srcDirectory = path.join(
        TOTAL_TYPESCRIPT_REPOS_FOLDER,
        "my-trpc-course",
        "src"
      );

      await fs.ensureDir(srcDirectory);

      expect(await fs.exists(srcDirectory)).toBe(true);

      await printCourseToRepo({
        id: course.id,
      });

      expect(await fs.exists(srcDirectory)).toBe(false);
    });
  });

  it("Should create section folders for each section", async () => {
    await mockFS(async (fs) => {
      const course = await serverFunctions.courses.create({
        title: "My tRPC Course",
        repoSlug: "my-trpc-course",
      });

      await serverFunctions.sections.create({
        courseId: course.id,
        title: "Section 1",
      });

      await serverFunctions.sections.create({
        courseId: course.id,
        title: "Section 2",
      });

      await fs.ensureDir(
        path.join(TOTAL_TYPESCRIPT_REPOS_FOLDER, "my-trpc-course", "src")
      );

      await printCourseToRepo({
        id: course.id,
      });

      const section1Directory = path.join(
        TOTAL_TYPESCRIPT_REPOS_FOLDER,
        "my-trpc-course",
        "src",
        "001-section-1"
      );

      const section2Directory = path.join(
        TOTAL_TYPESCRIPT_REPOS_FOLDER,
        "my-trpc-course",
        "src",
        "002-section-2"
      );

      expect(await fs.exists(section1Directory)).toBe(true);
      expect(await fs.exists(section2Directory)).toBe(true);
    });
  });

  it("Should create exercise folders for each exercise", async () => {
    await mockFS(async (fs) => {
      const course = await serverFunctions.courses.create({
        title: "My tRPC Course",
        repoSlug: "my-trpc-course",
      });

      const section1 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "Section 1",
      });

      const section2 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "Section 2",
      });

      const exercise1 = await serverFunctions.exercises.create({
        sectionId: section1.id,
        title: "Exercise 1",
      });

      await serverFunctions.exercises.createExplainerFile({
        id: exercise1.id,
      });

      const exercise2 = await serverFunctions.exercises.create({
        sectionId: section2.id,
        title: "Exercise 2",
      });

      await serverFunctions.exercises.createExplainerFile({
        id: exercise2.id,
      });

      await fs.ensureDir(
        path.join(TOTAL_TYPESCRIPT_REPOS_FOLDER, "my-trpc-course", "src")
      );

      await printCourseToRepo({
        id: course.id,
      });

      const exercise1Path = path.join(
        TOTAL_TYPESCRIPT_REPOS_FOLDER,
        "my-trpc-course",
        "src",
        "001-section-1",
        "001-exercise-1",
        "001-exercise-1.explainer.ts"
      );
      expect(await fs.exists(exercise1Path)).toBe(true);

      const exercise2Path = path.join(
        TOTAL_TYPESCRIPT_REPOS_FOLDER,
        "my-trpc-course",
        "src",
        "002-section-2",
        "002-exercise-2",
        "002-exercise-2.explainer.ts"
      );

      expect(await fs.exists(exercise2Path)).toBe(true);
    });
  });

  it("Should remove any prefixes in the files", async () => {
    await mockFS(async (fs) => {
      const course = await serverFunctions.courses.create({
        title: "My tRPC Course",
        repoSlug: "my-trpc-course",
      });

      const section1 = await serverFunctions.sections.create({
        courseId: course.id,
        title: "Section 1",
      });

      const exercise1 = await serverFunctions.exercises.create({
        sectionId: section1.id,
        title: "Exercise 1",
      });

      await serverFunctions.exercises.createExplainerFile({
        id: exercise1.id,
      });

      await fs.ensureDir(
        path.join(TOTAL_TYPESCRIPT_REPOS_FOLDER, "my-trpc-course", "src")
      );

      await printCourseToRepo({
        id: course.id,
      });

      const exercise1Path = path.join(
        TOTAL_TYPESCRIPT_REPOS_FOLDER,
        "my-trpc-course",
        "src",
        "001-section-1",
        "001-exercise-1",
        "001-exercise-1.explainer.ts"
      );

      expect(await fs.readFile(exercise1Path, "utf-8")).toEqual("");
    });
  });
});
