#!/usr/bin/env node

import type { RelativePath } from "@total-typescript/shared";
import {
  applyTwoslashToCode,
  type ApplyShikiFailure,
  type ApplyShikiSuccess,
} from "@total-typescript/twoslash-shared";
import { Command } from "commander";
import fg from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import packageJson from "../package.json" with { type: "json" };
import { getLangFromCodeFence } from "./getLangFromCodeFence.js";
import { watch } from "chokidar";

const program = new Command();

program.version(packageJson.version);

const shikiResultCache = new Map<
  string,
  ApplyShikiFailure | ApplyShikiSuccess
>();

const serializeLangAndCode = (lang: string, code: string) => {
  return `${lang}:${code}`;
};

const runChecks = async (
  files: RelativePath[],
  opts: {
    exitOnError: boolean;
    autofix: boolean;
  }
) => {
  let totalErrors = 0;
  for (const file of files) {
    const errors: {
      file: RelativePath;
      line: number;
      title: string;
      description: string;
      recommendation: string;
      errorFix: string | undefined;
    }[] = [];
    if (!file.endsWith(".md")) continue;

    const fileContents = await readFile(file, "utf8");

    const lines = fileContents.split("\n");

    for (let lineCursor = 0; lineCursor < lines.length; lineCursor++) {
      const currentLineCursor = lineCursor;
      const line = lines[lineCursor]!;
      if (line.startsWith("```") && line.includes("twoslash")) {
        const code = [];
        for (
          let codeCursor = lineCursor + 1;
          codeCursor < lines.length;
          codeCursor++
        ) {
          const nextLine = lines[codeCursor]!;
          if (nextLine.startsWith("```")) {
            // Move the line cursor to the end of the code block
            lineCursor = codeCursor + 1;
            break;
          }
          code.push(nextLine);
        }

        const codeString = code.join("\n");

        const lang = getLangFromCodeFence(line);

        const cacheKey = serializeLangAndCode(lang, codeString);

        const cacheResult = shikiResultCache.get(cacheKey);

        let result: ApplyShikiFailure | ApplyShikiSuccess;

        if (cacheResult) {
          result = cacheResult;
        } else {
          const freshResult = await applyTwoslashToCode({
            code: codeString,
            lang,
          });

          shikiResultCache.set(cacheKey, freshResult);

          result = freshResult;
        }

        if (!result.success) {
          // A typical description:
          //
          // These errors were not marked as being expected: 7006.
          // Expected: // @errors: 7006
          const errorFix = result.description
            .split("\n")[1]
            ?.split(": ")
            .slice(1)
            .join(": ")
            .trim();

          errors.push({
            file,
            line: currentLineCursor + 1,
            title: result.title,
            description: result.description,
            recommendation: result.recommendation,
            errorFix: errorFix,
          });
          totalErrors++;
        }
      }
    }
    let numberOfLinesAdded = 0;
    if (errors.length > 0) {
      for (const error of errors) {
        if (opts.autofix && error.errorFix) {
          const line = error.line + numberOfLinesAdded;
          const fileContents = await readFile(error.file, "utf8");

          const lines = fileContents.split("\n");

          lines.splice(line, 0, error.errorFix);

          await writeFile(error.file, lines.join("\n"));

          numberOfLinesAdded++;
        }

        console.error(`${error.file}:${error.line}`);
        console.error("");
        console.error(error.title);
        console.error("");
        console.error(error.description);
        console.error("");
        console.error(error.recommendation);
        console.error("");
      }

      if (opts.exitOnError) {
        process.exit(1);
      }
    }
  }
  if (totalErrors === 0) {
    console.log("No errors found");
  }
};

program
  .argument("<glob>")
  .option("-w, --watch", "Watch files for changes", false)
  .option("-f, --fix", "Automatically fix errors", false)
  .action(
    async (
      globString: string,
      opts: {
        watch: boolean;
        fix: boolean;
      }
    ) => {
      const files = (await fg(globString)) as RelativePath[];

      await runChecks(files, {
        exitOnError: !opts.watch,
        autofix: opts.fix,
      });

      if (opts.watch) {
        watch(globString).on("change", async (path) => {
          console.log(`File changed:`, path);
          console.log("");

          await runChecks([path as RelativePath], {
            exitOnError: false,
            autofix: opts.fix,
          });
        });
      }
    }
  );

program.parse(process.argv);
