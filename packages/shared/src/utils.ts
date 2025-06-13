import { type ExecOptions } from "child_process";
import { Effect } from "effect";
import type { ObjectEncodingOptions } from "fs";
import { stat } from "fs/promises";
import { ExecService } from "./exec-service.js";

export const pathExists = (path: string) => {
  return Effect.tryPromise(async () => {
    await stat(path);
    return true;
  }).pipe(Effect.catchAll(() => Effect.succeed(false)));
};

export const execAsync = (
  command: string,
  opts?: Omit<ExecOptions, "signal"> & ObjectEncodingOptions
) => {
  return Effect.gen(function* () {
    const execService = yield* ExecService;

    const result = yield* execService.exec(command, opts);

    return result;
  });
};

export const exitProcessWithError = (message: string) => {
  console.error(message);
  process.exit(1);
};

export class ExternalDriveNotFoundError {
  readonly name = "ExternalDriveNotFoundError";
  message: string;

  constructor(public path: string) {
    this.message = `External drive not found: ${path}`;
  }
}

export const toDashCase = (str: string) => {
  return str.replaceAll(" ", "-").toLowerCase();
};

export type HeadingWithContentSection = {
  type: "heading-with-content";
  heading: string;
  headingLevel: number;
  content: string;
  startIndex: number;
};

export type NoHeadingContentSection = {
  type: "no-heading-content";
  content: string;
  startIndex: number;
};

export type MarkdownSection =
  | HeadingWithContentSection
  | NoHeadingContentSection;
