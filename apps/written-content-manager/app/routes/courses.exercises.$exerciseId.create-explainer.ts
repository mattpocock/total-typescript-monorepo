import type { ActionFunctionArgs } from "@remix-run/node";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { p } from "~/db";
import { editExerciseUrl } from "~/routes";
import { createVSCodeFilename } from "~/utils";
import { getExerciseDir, getVSCodeFiles } from "~/vscode-utils";

export const action = async ({ params }: ActionFunctionArgs) => {
  const { exerciseId } = params;

  const files = await getVSCodeFiles(exerciseId!);

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

  const explainerFile = path.join(
    exercisePath,
    `${createVSCodeFilename(exercise.title)}.explainer.ts`
  ) as AbsolutePath;

  const firstLine = `// http://localhost:3004${editExerciseUrl(exerciseId!)}`;

  await fs.writeFile(explainerFile, firstLine);

  await execAsync(`code "${explainerFile}"`);

  return null;
};
