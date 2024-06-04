#!/usr/bin/env node

import {
  exitProcessWithError,
  getActiveEditorFilePath,
  type AbsolutePath,
  type AnyPath,
  type RelativePath,
} from "@total-typescript/shared";
import { applyShiki } from "@total-typescript/twoslash-preview-shared";
import { Command } from "commander";
import { readFile, writeFile } from "node:fs/promises";
import path from "path";
import fg from "fast-glob";

const program = new Command();

program.version("0.0.1");

const wrappedApplyShiki = async (
  filePath: AbsolutePath,
  fileContents: string,
) => {
  try {
    return await applyShiki(fileContents);
  } catch (error: any) {
    console.error(filePath);
    console.error(error.title);
    console.error(error.description);
    console.error(error.recommendation);
    exitProcessWithError("Error applying shiki");
  }
};

program.argument("<glob>").action(async (globString: string) => {
  const filePaths = (await fg(globString)).map((relativePath) => {
    return path.resolve(process.cwd(), relativePath) as AbsolutePath;
  });

  for (const filePath of filePaths) {
    const fileContents = await readFile(filePath, "utf-8");

    const result = await wrappedApplyShiki(filePath, fileContents);

    const cssLocation = path.resolve(import.meta.dirname, "output.css");

    const css = await readFile(cssLocation, "utf-8");

    const output = [`<style>`, css, `</style>`, result.html].join("\n");

    const outputFilename = filePath + ".email.html";

    writeFile(outputFilename, output, "utf-8");
  }
});

program.parse(process.argv);
