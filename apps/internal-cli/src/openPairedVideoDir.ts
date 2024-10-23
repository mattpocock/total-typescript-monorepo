import {
  REPOS_FOLDER,
  execAsync,
  exitProcessWithError,
  getActiveEditorFilePath,
  parseExercisePath,
  type AbsolutePath,
} from "@total-typescript/shared";
import { okAsync, safeTry } from "neverthrow";
import path from "path";
import { EXTERNAL_DRIVE_MOVIES_ROOT, getExternalDrive } from "./constants.js";

export const openPairedVideoDir = async () => {
  return safeTry(async function* () {
    const activeEditorFilePath = yield* await getActiveEditorFilePath();

    yield* getExternalDrive();

    const relativePath = path.relative(REPOS_FOLDER, activeEditorFilePath);

    const targetPath = path.resolve(
      EXTERNAL_DRIVE_MOVIES_ROOT,
      relativePath
    ) as AbsolutePath;

    const exercisePath = yield* parseExercisePath(targetPath);

    const { resolvedPath } = exercisePath;

    yield* execAsync(`open "${path.dirname(resolvedPath)}"`);

    return okAsync(void 0);
  }).mapErr((e) => {
    exitProcessWithError(e.message);
  });
};
