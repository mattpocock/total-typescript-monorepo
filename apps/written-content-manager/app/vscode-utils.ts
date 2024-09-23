import { ensureDir } from "@total-typescript/shared";
import path from "path";
import glob from "fast-glob";

export const EXERCISE_PLAYGROUND_ROOT_PATH = path.join(
  import.meta.dirname,
  "..",
  "..",
  "exercise-playground",
  "src"
);

export const getVSCodeFiles = async (exerciseId: string) => {
  const exercisePath = path.join(EXERCISE_PLAYGROUND_ROOT_PATH, exerciseId!);

  await ensureDir(exercisePath);

  const possiblePaths = [
    "*.problem.*{ts,tsx}",
    "*.solution.*{ts,tsx}",
    "*.explainer.*{ts,tsx}",
  ];

  const files = await glob(possiblePaths, {
    cwd: exercisePath,
    onlyFiles: true,
    absolute: true,
  });

  return files;
};
