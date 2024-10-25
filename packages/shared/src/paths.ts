import { err, ok, Result } from "neverthrow";
import type { AnyPath } from "./types.js";
import { execAsync } from "./utils.js";
import { access, rm } from "fs/promises";

export class ExerciseNotFoundError {
  message: string;
  constructor(public path: string) {
    this.message = `Path appears not to be an exercise: ${path}`;
  }
}

const regex = /^\d{1,}/;

export const parseExercisePath = <T extends AnyPath>(
  fullPathname: T
): Result<
  {
    resolvedPath: T;
    num: string;
  },
  ExerciseNotFoundError
> => {
  const splitPathname = fullPathname.split("/");

  const exerciseLabelIndex = splitPathname.findLastIndex((pathPart) => {
    return regex.test(pathPart);
  });

  if (exerciseLabelIndex === -1) {
    return err(new ExerciseNotFoundError(fullPathname));
  }

  return ok({
    resolvedPath: splitPathname.slice(0, exerciseLabelIndex + 1).join("/") as T,
    num: splitPathname[exerciseLabelIndex]?.match(regex)?.[0] as string,
  });
};

export const ensureDir = (dir: string) => {
  return execAsync(`mkdir -p "${dir}"`).then((r) => r._unsafeUnwrap());
};

export const exists = (dir: string) => {
  return access(dir).then(
    () => true,
    () => false
  );
};

export const rimraf = (dir: string) => {
  return rm(dir, {
    recursive: true,
    force: true,
  });
};
