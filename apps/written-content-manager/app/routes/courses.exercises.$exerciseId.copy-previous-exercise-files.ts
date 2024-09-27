import type { ActionFunctionArgs } from "@remix-run/node";
import {
  ensureDir,
  execAsync,
  type AbsolutePath,
} from "@total-typescript/shared";
import { p } from "~/db";
import { sanitizeForVSCodeFilename } from "~/utils";
import {
  getExerciseDir,
  getVSCodeFiles,
  modifyLinkingComment,
} from "~/vscode-utils";

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
      sectionId: true,
      order: true,
    },
  });

  const prevExercise = await p.exercise.findFirst({
    where: {
      sectionId: exercise.sectionId,
      order: {
        lt: exercise.order,
      },
      deleted: false,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!prevExercise) {
    throw new Response("No previous exercise found", { status: 400 });
  }

  const prevFiles = await getVSCodeFiles(prevExercise.id);

  if (prevFiles.length === 0) {
    throw new Response(`No files found for exercise ${prevExercise.id}`, {
      status: 400,
    });
  }

  const prevFilesDir = getExerciseDir(prevExercise.id);

  const prevExerciseTitleAsVSCodeFilename = sanitizeForVSCodeFilename(
    prevExercise.title
  );

  const newExerciseTitleAsVSCodeFilename = sanitizeForVSCodeFilename(
    exercise.title
  );

  let fileToOpen: string = "";

  for (const prevFile of prevFiles) {
    const relativePath = path.relative(prevFilesDir, prevFile);

    const newFilePath = path
      .resolve(exercisePath, relativePath)
      .replaceAll(
        prevExerciseTitleAsVSCodeFilename,
        newExerciseTitleAsVSCodeFilename
      ) as AbsolutePath;

    if (!fileToOpen) {
      fileToOpen = newFilePath;
    }

    await ensureDir(path.dirname(newFilePath));

    const fileContents = await fs.readFile(prevFile, "utf-8");

    await fs.writeFile(
      newFilePath,
      modifyLinkingComment(fileContents, exerciseId!)
    );
  }

  await execAsync(`code "${fileToOpen}"`).mapErr((e) => {
    throw new Response(e.message, { status: 500 });
  });

  return null;
};
