import type { ActionFunctionArgs } from "@remix-run/node";
import { execAsync } from "@total-typescript/shared";
import { p } from "~/db";
import { editExerciseUrl } from "~/routes";
import { createVSCodeFilename } from "~/utils";
import { EXERCISE_PLAYGROUND_ROOT_PATH, getVSCodeFiles } from "~/vscode-utils";

export const action = async ({ params }: ActionFunctionArgs) => {
  const { exerciseId } = params;
  const path = await import("node:path");
  const fs = await import("node:fs/promises");

  const files = await getVSCodeFiles(exerciseId!);

  const exercisePath = path.join(EXERCISE_PLAYGROUND_ROOT_PATH, exerciseId!);

  if (files.length === 0) {
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
      `${createVSCodeFilename(exercise.title)}.problem.ts`
    );

    const newSolutionFile = path.join(
      exercisePath,
      `${createVSCodeFilename(exercise.title)}.solution.ts`
    );

    const firstLine = `// http://localhost:3004${editExerciseUrl(exerciseId!)}`;

    await fs.writeFile(newProblemFile, firstLine);
    await fs.writeFile(newSolutionFile, firstLine);

    await execAsync(`code "${newProblemFile}"`);
  } else {
    await execAsync(`code "${files[0]}"`);
  }

  return null;
};
