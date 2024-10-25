import { ensureDir, exists } from "@total-typescript/shared";
import { readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { describe, expect, it } from "vitest";
import { printCourseToRepo } from "../print-course-to-repo";
import { serverFunctions } from "../server-functions";

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
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
      repoSlug: "my-trpc-course",
    });

    await expect(
      printCourseToRepo({
        id: course.id,
      })
    ).rejects.toThrow(
      "Repo my-trpc-course does not exist in total-typescript folder"
    );
  });

  it('Should delete the "src" folder in the course repo', async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
      repoSlug: "my-trpc-course",
    });

    const srcDirectory = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "src"
    );

    await ensureDir(srcDirectory);

    expect(await exists(srcDirectory)).toBe(true);

    await printCourseToRepo({
      id: course.id,
    });

    expect(await exists(srcDirectory)).toBe(false);
  });

  it("Should create section folders for each section", async () => {
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

    await ensureDir(
      path.join(globalThis.testPaths?.reposDir!, "my-trpc-course", "src")
    );

    await printCourseToRepo({
      id: course.id,
    });

    const section1Directory = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "001-section-1"
    );

    const section2Directory = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "002-section-2"
    );

    expect(await exists(section1Directory)).toBe(true);
    expect(await exists(section2Directory)).toBe(true);
  });

  it("Should create exercise folders for each exercise", async () => {
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

    await ensureDir(
      path.join(globalThis.testPaths?.reposDir!, "my-trpc-course", "src")
    );

    await printCourseToRepo({
      id: course.id,
    });

    const exercise1Path = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "001-section-1",
      "001-exercise-1",
      "001-exercise-1.explainer.ts"
    );
    expect(await exists(exercise1Path)).toBe(true);

    const exercise2Path = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "002-section-2",
      "002-exercise-2",
      "002-exercise-2.explainer.ts"
    );

    expect(await exists(exercise2Path)).toBe(true);
  });

  it("Should create a mapping in the root between exercises and directories", async () => {
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

    await ensureDir(
      path.join(globalThis.testPaths?.reposDir!, "my-trpc-course", "src")
    );

    await printCourseToRepo({
      id: course.id,
    });

    const mappingPath = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "_map.json"
    );

    const mapping = JSON.parse(await readFile(mappingPath, "utf-8"));

    expect(mapping).toEqual({
      [exercise1.id]: "001-section-1/001-exercise-1",
      [exercise2.id]: "002-section-2/002-exercise-2",
    });
  });

  it("Should remove any prefixes in the files", async () => {
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

    await ensureDir(
      path.join(globalThis.testPaths?.reposDir!, "my-trpc-course", "src")
    );

    await printCourseToRepo({
      id: course.id,
    });

    const exercise1Path = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "001-section-1",
      "001-exercise-1",
      "001-exercise-1.explainer.ts"
    );

    expect(await readFile(exercise1Path, "utf-8")).toEqual("");
  });

  it("Should not duplicate 00X prefixes in the files", async () => {
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

    const { filePath } = await serverFunctions.exercises.createExplainerFile({
      id: exercise1.id,
    });

    const explainerDir = path.dirname(filePath);

    // Create a file with a 00X prefix
    const newFilePath = path.join(explainerDir, "010-exercise-1.explainer.ts");

    await rm(filePath);
    await writeFile(newFilePath, "");

    await ensureDir(
      path.join(globalThis.testPaths?.reposDir!, "my-trpc-course", "src")
    );

    await printCourseToRepo({
      id: course.id,
    });

    const exercise1Path = path.join(
      globalThis.testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "001-section-1",
      "001-exercise-1",
      "001-exercise-1.explainer.ts"
    );

    expect(await readFile(exercise1Path, "utf-8")).toEqual("");
  });

  it("Should update the course lastPrintedToRepoAt date", async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
      repoSlug: "my-trpc-course",
    });

    await serverFunctions.sections.create({
      courseId: course.id,
      title: "Section 1",
    });

    await ensureDir(
      path.join(globalThis.testPaths?.reposDir!, "my-trpc-course", "src")
    );

    const beforePrintDate = new Date();

    await printCourseToRepo({
      id: course.id,
    });

    const afterPrintDate = new Date();

    const updatedCourse = await serverFunctions.courses.get({
      id: course.id,
    });

    expect(updatedCourse.lastPrintedToRepoAt?.getTime()).toBeGreaterThan(
      beforePrintDate.getTime()
    );
    expect(updatedCourse.lastPrintedToRepoAt?.getTime()).toBeLessThan(
      afterPrintDate.getTime()
    );
  });
});
