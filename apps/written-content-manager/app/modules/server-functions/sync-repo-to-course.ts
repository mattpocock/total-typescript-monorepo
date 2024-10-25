import { access, readFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { createServerFunction } from "./utils";

export const syncRepoToCourse = createServerFunction(
  z.object({
    id: z.string().uuid(),
    reposDir: z.string(),
  }),
  async ({ input, p }) => {
    const course = await p.course.findUniqueOrThrow({
      where: {
        id: input.id,
      },
    });

    if (!course.repoSlug) {
      throw new Error("Course does not have a repo slug");
    }

    const coursePath = path.join(input.reposDir, course.repoSlug);

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

      const locationOnDisk = path.join(coursePath, map[exerciseId]!);

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
    }
  }
);
