import type { AnyPath } from "./types.js";
import { execAsync } from "./utils.js";
import { access, rm } from "fs/promises";
import { Effect, pipe } from "effect";

export class FailedToRemoveDirectoryError extends Error {
  readonly _tag = "FailedToRemoveDirectoryError";
  override message = "Failed to remove directory";
  constructor(public override cause: Error) {
    super();
  }
}

export class FailedToCreateDirectoryError extends Error {
  readonly _tag = "FailedToCreateDirectoryError";
  override message = "Failed to create directory";
  constructor(public override cause: Error) {
    super();
  }
}

export const ensureDir = (dir: string) => {
  return pipe(
    execAsync(`mkdir -p "${dir}"`),
    Effect.catchAll((e) => {
      return Effect.fail(new FailedToCreateDirectoryError(e));
    })
  );
};

export const exists = (dir: string) => {
  return pipe(
    Effect.tryPromise(async () => {
      await access(dir);
      return true;
    }),
    Effect.catchAll(() => {
      return Effect.succeed(false);
    })
  );
};

export const rimraf = (dir: string) => {
  return pipe(
    Effect.tryPromise(async () => {
      await rm(dir, {
        recursive: true,
        force: true,
      });
    }),
    Effect.catchAll((e) => {
      return Effect.fail(new FailedToRemoveDirectoryError(e));
    })
  );
};
