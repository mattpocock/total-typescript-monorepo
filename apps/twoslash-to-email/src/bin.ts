#!/usr/bin/env node

import {
  exitProcessWithError,
  getActiveEditorFilePath,
  type AnyPath,
  type RelativePath,
} from "@total-typescript/shared";
import { applyShiki } from "@total-typescript/twoslash-preview-shared";
import { Command } from "commander";
import { readFileSync } from "fs";
import path from "path";

const program = new Command();

program.version("0.0.1");

program.argument("[file-path]").action(async (filePath?: RelativePath) => {
  let resolvedFilePath: AnyPath;

  if (!filePath) {
    const activeEditorFilePath = await getActiveEditorFilePath();

    if (!activeEditorFilePath) {
      exitProcessWithError("No file path provided and no active editor found");
    }

    resolvedFilePath = activeEditorFilePath;
  } else {
    resolvedFilePath = filePath;
  }

  if (!resolvedFilePath.endsWith(".md")) {
    exitProcessWithError("File must be a markdown file.");
  }

  const fileContents = readFileSync(resolvedFilePath, "utf-8");

  const result = await applyShiki(fileContents);

  const cssLocation = path.resolve(import.meta.dirname, "output.css");

  const css = readFileSync(cssLocation, "utf-8");

  console.log([`<style>`, css, `</style>`, result.html].join("\n"));
});

program.parse(process.argv);
