import {
  EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
  ExerciseNotFoundError,
  ExternalDriveNotFoundError,
  REPOS_FOLDER,
  exitProcessWithError,
  getExternalDrive,
  parseExercisePath,
  type AbsolutePath,
} from "@total-typescript/shared";
import { getActiveEditorFilePath } from "./getActiveEditorFilePath.js";
import { execSync } from "child_process";
import path from "path";

export const openPairedVideoDir = async () => {
  const activeEditorFilePath = await getActiveEditorFilePath();

  if (!activeEditorFilePath) {
    exitProcessWithError("No active editor file path found");
  }

  const externalDrive = await getExternalDrive();

  if (externalDrive instanceof ExternalDriveNotFoundError) {
    exitProcessWithError(`External drive not found at ${externalDrive.path}`);
  }

  const relativePath = path.relative(REPOS_FOLDER, activeEditorFilePath);
  const targetPath = path.resolve(
    EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
    relativePath,
  ) as AbsolutePath;

  const exercisePath = parseExercisePath(targetPath);

  if (exercisePath instanceof ExerciseNotFoundError) {
    exitProcessWithError(`No exercise found in ${exercisePath.path}`);
  }

  const { resolvedPath } = exercisePath;

  execSync(`open "${path.dirname(resolvedPath)}"`);
};