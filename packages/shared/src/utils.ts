import { exec, type ExecException, type ExecOptions } from "child_process";
import { stat } from "fs/promises";
import { errAsync, ok, ResultAsync } from "neverthrow";
import type { AbsolutePath } from "./types.js";
import type { ObjectEncodingOptions } from "fs";

export const pathExists = (path: string) => {
  return ResultAsync.fromPromise(stat(path), (e) => e)
    .map(() => true)
    .orElse(() => ok(false));
};

export const execAsync = (
  command: string,
  opts?: ExecOptions & ObjectEncodingOptions
) => {
  return ResultAsync.fromPromise(
    new Promise<{
      stdout: string;
      stderr: string;
    }>((resolve, reject) => {
      exec(command, opts, (e, stdout, stderr) => {
        if (e) {
          reject(e);
        }

        resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
      });
    }),
    (e) => {
      return e as ExecException;
    }
  );
};

export const revealInFileExplorer = (
  file: AbsolutePath
): ResultAsync<
  {
    stdout: string;
    stderr: string;
  },
  Error
> => {
  if (process.platform === "win32") {
    return execAsync(`explorer /select,${file}`);
  } else if (process.platform === "darwin") {
    return execAsync(`open -R "${file}"`);
  } else {
    return errAsync(new Error("Unsupported platform"));
  }
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

export const returnMarkdownHeadingsAndContents = (
  markdown: string
): MarkdownSection[] => {
  const sections: MarkdownSection[] = [];
  const lines = markdown.split("\n");
  let currentSection: MarkdownSection | undefined = {
    type: "no-heading-content",
    content: "",
    startIndex: 0,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("#")) {
      if (
        currentSection?.type === "no-heading-content" &&
        currentSection.content.length === 0
      ) {
        currentSection = undefined;
      }

      if (currentSection) {
        sections.push(currentSection);
      }

      const headingLevel = line.split("#").length - 1;
      const heading = line.replace(/#/g, "").trim();
      currentSection = {
        type: "heading-with-content",
        startIndex: i,
        heading,
        headingLevel,
        content: "",
      };
    } else if (currentSection) {
      currentSection.content = `${currentSection.content}\n${line}`;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};
