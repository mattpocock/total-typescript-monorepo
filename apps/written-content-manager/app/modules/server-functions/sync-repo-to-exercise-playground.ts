import { rimraf, type AbsolutePath } from "@total-typescript/shared";
import { access, cp, readFile, rename } from "fs/promises";
import path from "path";
import { z } from "zod";
import { getExerciseDir } from "~/vscode-utils";
import { createServerFunction } from "./utils";
import { createTmpDir } from "./tests/test-utils";

export const syncRepoToExercisePlayground = createServerFunction(
  z.object({
    id: z.string().uuid(),
  }),
  async ({ input, p, paths }) => {
    const course = await p.course.findUniqueOrThrow({
      where: {
        id: input.id,
      },
    });

    if (!course.repoSlug) {
      throw new Error("Course does not have a repo slug");
    }

    const coursePath = path.join(paths.reposDir, course.repoSlug);

    const exists = await access(coursePath).then(
      () => true,
      () => false
    );

    if (!exists) {
      throw new Error(
        `Repo ${course.repoSlug} does not exist in total-typescript folder`
      );
    }

    const mapLocation = path.join(coursePath, "_map.json");

    let map: Record<string, string> = {};

    try {
      map = await readFile(mapLocation, "utf-8").then(JSON.parse);
    } catch (e) {
      throw new Error(`Repo ${course.repoSlug} does not have a _map.json file`);
    }

    const exerciseIds = Object.keys(map);

    const exercises = await p.exercise
      .findMany({
        where: {
          id: {
            in: exerciseIds,
          },
        },
      })
      .then((map) => {
        return new Map(map.map((exercise) => [exercise.id, exercise]));
      });

    for (const exerciseId of exerciseIds) {
      const exercise = exercises.get(exerciseId);

      if (!exercise) {
        throw new Error(
          `Exercise with id ${exerciseId} does not exist in the database`
        );
      }

      const locationOnDisk = path.join(
        coursePath,
        "src",
        map[exerciseId]!
      ) as AbsolutePath;

      if (
        !(await access(locationOnDisk).then(
          () => true,
          () => false
        ))
      ) {
        throw new Error(
          `Exercise with id ${exerciseId} does not exist on disk at ${map[exerciseId]!}`
        );
      }

      const exerciseDir = getExerciseDir(exercise.id);

      const tmpDir = await createTmpDir();

      const audioFileOriginalLocation = path.join(exerciseDir, "audio.mkv");

      const tmpAudioFileLocation = path.join(tmpDir.dir, "audio.mkv");

      try {
        await rename(audioFileOriginalLocation, tmpAudioFileLocation);
      } catch (e) {}

      await rimraf(exerciseDir);

      await cp(locationOnDisk, exerciseDir, {
        recursive: true,
        force: true,
      });

      try {
        await rename(tmpAudioFileLocation, audioFileOriginalLocation);
      } catch (e) {}

      await rimraf(tmpDir.dir);
    }
  }
);
