import type { ActionFunctionArgs } from "@remix-run/node";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { p } from "~/db";
import { editExerciseUrl } from "~/routes";
import { sanitizeForVSCodeFilename } from "~/utils";
import { getExerciseDir, getVSCodeFilesForExercise } from "~/vscode-utils";

export const action = async ({ params }: ActionFunctionArgs) => {
  const { exerciseId } = params;

  const files = await getVSCodeFilesForExercise(exerciseId!);

  if (files.length > 0) {
    throw new Response("Files already exist", { status: 400 });
  }

  const path = await import("node:path");
  const fs = await import("node:fs/promises");

  const exercisePath = getExerciseDir(exerciseId!);

  const exercise = await p.exercise.findUniqueOrThrow({
    where: {
      id: exerciseId,
    },
    select: {
      title: true,
    },
  });

  const newProblemFile = path.join(
    exercisePath,
    `${sanitizeForVSCodeFilename(exercise.title)}.problem.ts`
  ) as AbsolutePath;

  const newSolutionFile = path.join(
    exercisePath,
    `${sanitizeForVSCodeFilename(exercise.title)}.solution.ts`
  ) as AbsolutePath;

  const firstLine = `// http://localhost:3004${editExerciseUrl(exerciseId!)}`;

  await fs.writeFile(newProblemFile, firstLine);
  await fs.writeFile(newSolutionFile, firstLine);

  await execAsync(`code "${newProblemFile}"`);

  return null;
};
