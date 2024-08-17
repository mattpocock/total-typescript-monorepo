import {
  ExerciseNotFoundError,
  ExternalDriveNotFoundError,
  REPOS_FOLDER,
  execAsync,
  exitProcessWithError,
  getActiveEditorFilePath,
  parseExercisePath,
  type AbsolutePath,
} from "@total-typescript/shared";
import { execSync } from "child_process";
import path from "path";
import { EXTERNAL_DRIVE_MOVIES_ROOT, getExternalDrive } from "./constants.js";
import { okAsync, safeTry } from "neverthrow";
import { ok } from "assert";

export const openPairedVideoDir = async () => {
  return safeTry(async function* () {
    const activeEditorFilePath = yield* (
      await getActiveEditorFilePath()
    ).safeUnwrap();

    yield* getExternalDrive().safeUnwrap();

    const relativePath = path.relative(REPOS_FOLDER, activeEditorFilePath);

    const targetPath = path.resolve(
      EXTERNAL_DRIVE_MOVIES_ROOT,
      relativePath,
    ) as AbsolutePath;

    const exercisePath = yield* parseExercisePath(targetPath).safeUnwrap();

    const { resolvedPath } = exercisePath;

    yield* execAsync(`open "${path.dirname(resolvedPath)}"`).safeUnwrap();

    return okAsync(void 0);
  }).then((result) => {
    return result.mapErr((err) => {
      exitProcessWithError(err.message);
    });
  });
};
