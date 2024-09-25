import { ensureDir, type AbsolutePath } from "@total-typescript/shared";
import path from "path";
import glob from "fast-glob";
import { existsSync } from "fs";
import { access } from "fs/promises";

export const EXERCISE_PLAYGROUND_ROOT_PATH = path.join(
  import.meta.dirname,
  "..",
  "..",
  "exercise-playground",
  "src"
);

export const getExerciseDir = (exerciseId: string) => {
  return path.join(EXERCISE_PLAYGROUND_ROOT_PATH, exerciseId) as AbsolutePath;
};

export const AUDIO_FILE_NAME = "audio.mkv";

export const getAudioPathForExercise = (exerciseId: string) => {
  return path.join(getExerciseDir(exerciseId), AUDIO_FILE_NAME) as AbsolutePath;
};

export const getDoesAudioExistForExercise = async (exerciseId: string) => {
  console.log(getAudioPathForExercise(exerciseId));
  return access(getAudioPathForExercise(exerciseId)).then(
    () => true,
    () => false
  );
};

export const getVSCodeFiles = async (exerciseId: string) => {
  const exercisePath = getExerciseDir(exerciseId);

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
