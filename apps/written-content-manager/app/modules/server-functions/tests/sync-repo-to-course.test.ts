import { mkdtemp, rm, writeFile } from "fs/promises";
import path from "path";
import { describe, expect, it } from "vitest";
import { serverFunctions } from "../server-functions";
import { syncRepoToCourse } from "../sync-repo-to-course";
import { ensureDir } from "@total-typescript/shared";
import { createTmpDir } from "./test-utils";

describe("sync-course-to-repo", () => {
  it("Should fail if the course does not have a repo slug", async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
    });

    await using dir = await createTmpDir();

    await expect(
      syncRepoToCourse({
        id: course.id,
        reposDir: dir.dir,
      })
    ).rejects.toThrow("Course does not have a repo slug");
  });

  it("Should fail if the course repo does not exist", async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
      repoSlug: "my-trpc-course",
    });

    await using dir = await createTmpDir();

    await expect(
      syncRepoToCourse({
        id: course.id,
        reposDir: dir.dir,
      })
    ).rejects.toThrow(
      "Repo my-trpc-course does not exist in total-typescript folder"
    );
  });

  it('Should fail if the course repo does not have a "_map.json" file', async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
      repoSlug: "my-trpc-course",
    });

    await using dir = await createTmpDir();

    await ensureDir(path.join(dir.dir, "my-trpc-course"));

    await expect(
      syncRepoToCourse({
        id: course.id,
        reposDir: dir.dir,
      })
    ).rejects.toThrow("Repo my-trpc-course does not have a _map.json file");
  });

  it("Should fail if the exercise does not exist in the database", async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
      repoSlug: "my-trpc-course",
    });

    await using dir = await createTmpDir();

    await ensureDir(path.join(dir.dir, "my-trpc-course"));

    await writeFile(
      path.join(dir.dir, "my-trpc-course", "_map.json"),
      JSON.stringify({
        "exercise-id": "exercise-file.ts",
      })
    );

    await expect(
      syncRepoToCourse({
        id: course.id,
        reposDir: dir.dir,
      })
    ).rejects.toThrow("Exercise with id exercise-id does not exist");
  });

  it("Should fail if the exercise mentioned in _map.json cannot be found on disk", async () => {
    const course = await serverFunctions.courses.create({
      title: "My tRPC Course",
      repoSlug: "my-trpc-course",
    });

    const section = await serverFunctions.sections.create({
      title: "My Section",
      courseId: course.id,
    });

    const exercise = await serverFunctions.exercises.create({
      title: "My Exercise",
      sectionId: section.id,
    });

    await using dir = await createTmpDir();

    await ensureDir(path.join(dir.dir, "my-trpc-course"));

    await writeFile(
      path.join(dir.dir, "my-trpc-course", "_map.json"),
      JSON.stringify({
        [exercise.id]: "001-my-section/001-my-exercise",
      })
    );

    await expect(
      syncRepoToCourse({
        id: course.id,
        reposDir: dir.dir,
      })
    ).rejects.toThrow(
      `Exercise with id ${exercise.id} does not exist on disk at 001-my-section/001-my-exercise`
    );
  });
});
