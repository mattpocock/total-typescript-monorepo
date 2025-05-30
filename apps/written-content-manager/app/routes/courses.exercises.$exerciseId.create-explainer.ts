import type { ActionFunctionArgs } from "@remix-run/node";
import { type AbsolutePath } from "@total-typescript/shared";
import { p } from "~/db";
import { fs } from "~/fs";
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

  const exercisePath = getExerciseDir(exerciseId!);

  const exercise = await p.exercise.findUniqueOrThrow({
    where: {
      id: exerciseId,
    },
    select: {
      title: true,
    },
  });

  const explainerFile = path.join(
    exercisePath,
    `${sanitizeForVSCodeFilename(exercise.title)}.explainer.ts`
  ) as AbsolutePath;

  const firstLine = `// http://localhost:3004${editExerciseUrl(exerciseId!)}`;

  await fs.writeFile(explainerFile, firstLine);

  await fs.openInVSCode(explainerFile);

  return null;
};
