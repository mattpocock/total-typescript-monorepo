import path from "path";
import { z } from "zod";
import { sanitizeForVSCodeFilename } from "~/utils";
import { getVSCodeFilesForExercise } from "~/vscode-utils";
import { createServerFunction } from "./utils";
import { getExerciseSuffix } from "./get-exercise-suffix";
import { ensureDir, exists, rimraf } from "@total-typescript/shared";
import { readFile, writeFile } from "fs/promises";

export const printCourseToRepo = createServerFunction(
  z.object({
    id: z.string().uuid(),
  }),
  async ({ input, p, paths }) => {
    const course = await p.course.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      include: {
        sections: {
          where: {
            deleted: false,
            title: {
              not: "",
            },
          },
          orderBy: {
            order: "asc",
          },
          include: {
            exercises: {
              where: {
                deleted: false,
                title: {
                  not: "",
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!course.repoSlug) {
      throw new Error("Course does not have a repo slug");
    }

    const coursePath = path.join(paths.reposDir, course.repoSlug);

    const courseExists = await exists(coursePath);

    if (!courseExists) {
      throw new Error(
        `Repo ${course.repoSlug} does not exist in total-typescript folder`
      );
    }

    const srcPath = path.join(coursePath, "src");

    await rimraf(srcPath);

    const exerciseMap: Record<string, string> = {};

    let totalExerciseCount = 0;

    for (
      let sectionIndex = 0;
      sectionIndex < course.sections.length;
      sectionIndex++
    ) {
      const section = course.sections[sectionIndex]!;

      const sectionName = `${(sectionIndex + 1).toString().padStart(3, "0")}-${sanitizeForVSCodeFilename(section.title)}`;

      const sectionPath = path.join(srcPath, sectionName);

      await ensureDir(sectionPath);

      for (
        let exerciseIndex = 0;
        exerciseIndex < section.exercises.length;
        exerciseIndex++
      ) {
        const exercise = section.exercises[exerciseIndex]!;

        const exerciseName = `${(totalExerciseCount + 1).toString().padStart(3, "0")}-${sanitizeForVSCodeFilename(exercise.title)}`;

        const exercisePath = path.join(sectionPath, exerciseName);

        await ensureDir(exercisePath);

        exerciseMap[exercise.id] = path.join(sectionName, exerciseName);

        const files = await getVSCodeFilesForExercise(exercise.id);

        for (const file of files) {
          const suffix = getExerciseSuffix(file);

          /* v8 ignore next */
          if (!suffix) continue;

          const contents = await readFile(file, "utf-8");

          const filePath = path.join(exercisePath, `${exerciseName}.${suffix}`);

          const lines = contents.split("\n");

          if (lines[0]?.startsWith("// http://localhost:3004")) {
            delete lines[0];
          }

          await writeFile(filePath, lines.join("\n").trimStart());
        }

        totalExerciseCount++;
      }
    }

    await writeFile(
      path.join(coursePath, "_map.json"),
      JSON.stringify(exerciseMap, null, 2) + "\n"
    );

    await p.course.update({
      where: {
        id: input.id,
      },
      data: {
        lastPrintedToRepoAt: new Date(),
      },
    });

    return {
      coursePath,
    };
  }
);
