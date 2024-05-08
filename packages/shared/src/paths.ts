import type { AnyPath } from "./types.js";

export class ExerciseNotFoundError {
  readonly _tag = "ExerciseNotFoundError";
}

const regex = /^\d{1,}/;

export const parseExercisePath = <T extends AnyPath>(fullPathname: T) => {
  const splitPathname = fullPathname.split("/");

  const exerciseLabelIndex = splitPathname.findLastIndex((pathPart) => {
    return regex.test(pathPart);
  });

  if (exerciseLabelIndex === -1) {
    return new ExerciseNotFoundError();
  }

  return {
    resolvedPath: splitPathname.slice(0, exerciseLabelIndex + 1).join("/") as T,
    num: splitPathname[exerciseLabelIndex]?.match(regex)?.[0] as string,
  };
};
