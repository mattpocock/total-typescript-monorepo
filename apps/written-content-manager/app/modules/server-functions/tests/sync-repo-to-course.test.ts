import { ensureDir } from "@total-typescript/shared";
import { readdir, writeFile } from "fs/promises";
import path from "path";
import { expect, it } from "vitest";
import { serverFunctions } from "../server-functions";
import { syncRepoToExercisePlayground } from "../sync-repo-to-exercise-playground";
import { getExerciseDir } from "~/vscode-utils";

it("Should fail if the course does not have a repo slug", async () => {
  const course = await serverFunctions.courses.create({
    title: "My tRPC Course",
  });

  await expect(
    syncRepoToExercisePlayground({
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
    syncRepoToExercisePlayground({
      id: course.id,
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

  await ensureDir(path.join(testPaths?.reposDir!, "my-trpc-course"));

  await expect(
    syncRepoToExercisePlayground({
      id: course.id,
    })
  ).rejects.toThrow("Repo my-trpc-course does not have a _map.json file");
});

it("Should fail if the exercise does not exist in the database", async () => {
  const course = await serverFunctions.courses.create({
    title: "My tRPC Course",
    repoSlug: "my-trpc-course",
  });

  await ensureDir(path.join(testPaths?.reposDir!, "my-trpc-course", "src"));

  await writeFile(
    path.join(testPaths?.reposDir!, "my-trpc-course", "_map.json"),
    JSON.stringify({
      "exercise-id": "exercise-file.ts",
    })
  );

  await expect(
    syncRepoToExercisePlayground({
      id: course.id,
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

  await ensureDir(path.join(testPaths?.reposDir!, "my-trpc-course", "src"));

  await writeFile(
    path.join(testPaths?.reposDir!, "my-trpc-course", "_map.json"),
    JSON.stringify({
      [exercise.id]: "001-my-section/001-my-exercise",
    })
  );

  await expect(
    syncRepoToExercisePlayground({
      id: course.id,
    })
  ).rejects.toThrow(
    `Exercise with id ${exercise.id} does not exist on disk at 001-my-section/001-my-exercise`
  );
});

it("Should not fail if the exercise mentioned in _map.json is an empty directory", async () => {
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

  await ensureDir(path.join(testPaths?.reposDir!, "my-trpc-course"));

  await writeFile(
    path.join(testPaths?.reposDir!, "my-trpc-course", "_map.json"),
    JSON.stringify({
      [exercise.id]: "001-my-section/001-my-exercise",
    })
  );

  await ensureDir(
    path.join(
      testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "001-my-section",
      "001-my-exercise"
    )
  );

  await expect(
    syncRepoToExercisePlayground({
      id: course.id,
    })
  ).resolves.not.toThrow();
});

it("Should replace all non-audio files in the exercise playground with the files from the course repo", async () => {
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

  await serverFunctions.exercises.createExplainerFile({
    id: exercise.id,
  });

  await ensureDir(path.join(testPaths?.reposDir!, "my-trpc-course", "src"));

  await writeFile(
    path.join(testPaths?.reposDir!, "my-trpc-course", "_map.json"),
    JSON.stringify({
      [exercise.id]: "001-my-section/001-my-exercise",
    })
  );

  await ensureDir(
    path.join(
      testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "001-my-section",
      "001-my-exercise"
    )
  );

  await writeFile(
    path.join(
      testPaths?.reposDir!,
      "my-trpc-course",
      "src",
      "001-my-section",
      "001-my-exercise",
      "exercise-file.explainer.ts"
    ),
    "console.log('Hello, World!');"
  );

  await writeFile(path.join(getExerciseDir(exercise.id), "audio.mkv"), "audio");

  await syncRepoToExercisePlayground({
    id: course.id,
  });

  const exerciseOnDb = await serverFunctions.exercises.get({
    id: exercise.id,
  });

  expect(exerciseOnDb.files).toHaveLength(1);
  expect(exerciseOnDb.files[0]!.path).toBe("exercise-file.explainer.ts");
  expect(exerciseOnDb.files[0]!.content).toBe("console.log('Hello, World!');");

  expect(exerciseOnDb.audioExists).toBe(true);
});
