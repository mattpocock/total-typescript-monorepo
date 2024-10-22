#!/usr/bin/env node

import { type AbsolutePath, type AnyPath } from "@total-typescript/shared";
import {
  compilerOptions,
  twoslashFromCDN,
} from "@total-typescript/twoslash-shared";
import { Command } from "commander";
import fg from "fast-glob";
import { readFile, writeFile } from "node:fs/promises";
import path from "path";
import packageJson from "../package.json" with { type: "json" };
import { getLangFromCodeFence } from "./getLangFromCodeFence.js";

type TwoslashReturn = Awaited<ReturnType<typeof twoslashFromCDN.run>>;

const program = new Command();

program.version(packageJson.version);

const run = async (filePath: AnyPath) => {
  const changes: {
    twoslashReturn: TwoslashReturn;
    startLine: number;
    endLine: number;
    lang: string;
  }[] = [];

  const fileContents = await readFile(filePath, "utf8");

  const lines = fileContents.split("\n");

  for (let lineCursor = 0; lineCursor < lines.length; lineCursor++) {
    const line = lines[lineCursor]!;
    if (line.startsWith("```") && line.includes("twoslash")) {
      const startLine = lineCursor;
      let endLine!: number;
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
          endLine = codeCursor;
          break;
        }
        code.push(nextLine);
      }

      const codeString = code.join("\n");

      const lang = getLangFromCodeFence(line);

      await twoslashFromCDN.prepareTypes(codeString);
      const result = await twoslashFromCDN.run(codeString, lang, {
        compilerOptions,
      });

      changes.push({ twoslashReturn: result, startLine, endLine, lang });
    }
  }

  changes.reverse();

  for (const change of changes) {
    const { twoslashReturn, startLine, endLine, lang } = change;
    const newCode = twoslashReturn.code;

    const codeLines = newCode.split("\n");

    const errorsAndQueries = [
      ...twoslashReturn.errors,
      ...twoslashReturn.queries,
    ].sort((a, b) => b.line - a.line);

    // For each error, insert it into the code
    // using a comment below the line
    errorsAndQueries.forEach((errorOrQuery) => {
      const lineAfter = errorOrQuery.line + 1;
      if (errorOrQuery.type === "error") {
        const squigglyLine = `//${" ".repeat(errorOrQuery.character - 2)}${"^".repeat(errorOrQuery.length)}`;

        const errorTextLines = errorOrQuery.text.split("\n");
        codeLines.splice(
          lineAfter,
          0,
          squigglyLine,
          ...errorTextLines.map((line) => `// ❗ ${line}`)
        );
      } else if (errorOrQuery.type === "query") {
        const pointer = `//${" ".repeat(errorOrQuery.character - 2)}${"^".repeat(errorOrQuery.length)} 🚁`;

        codeLines.splice(lineAfter, 0, pointer);
      }
    });

    twoslashReturn.queries.forEach((query) => {
      const lines = [
        `// 🚁 Hovering over \`${query.target}\` shows...`,
        ...query.text.split("\n"),
        "",
      ];

      codeLines.push(...lines);
    });

    lines.splice(
      startLine,
      endLine - startLine + 1,
      ...["```" + lang, codeLines.join("\n").trim(), "```"]
    );
  }

  const newFileContents = lines.join("\n");

  // new path is .output.md
  const newPath = filePath.replace(/\.md$/, ".output.md");

  await writeFile(newPath, newFileContents, "utf8");
};

program.argument("<glob>").action(async (globString: string) => {
  const filePaths = (await fg(globString)).map((relativePath) => {
    return path.resolve(process.cwd(), relativePath) as AbsolutePath;
  });

  for (const filePath of filePaths) {
    if (!filePath.endsWith(".md")) continue;

    await run(filePath);
  }
});

program.parse(process.argv);
