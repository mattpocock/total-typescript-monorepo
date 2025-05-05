import { anthropic } from "@ai-sdk/anthropic";
import { Agent, createTool } from "@mastra/core";
import { Memory } from "@mastra/memory";
import { globSync } from "node:fs";
import { glob, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";

const WRITER_PLAYGROUND_ROOT_PATH = path.join(
  homedir(),
  "repos",
  "matt",
  "mastra-ai-playground"
);

const writeFileTool = createTool({
  description: "Write text to a file",
  inputSchema: z.object({
    path: z.string(),
    text: z.string(),
  }),
  id: "writeFile",
  execute: async ({ context }) => {
    try {
      const filePath = path.join(WRITER_PLAYGROUND_ROOT_PATH, context.path);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, context.text);
      return `Wrote to ${filePath}`;
    } catch (error) {
      return typeof error === "object" && error !== null && "message" in error
        ? error.message
        : "Failed to write file: " + error;
    }
  },
});

const readFilesTool = createTool({
  description: "Read text from a file",
  inputSchema: z.object({
    paths: z.array(z.string()),
  }),
  id: "readFiles",
  execute: async ({ context }) => {
    const files = await Promise.all(
      context.paths.map(async (p) => {
        return {
          path: p,
          text: await readFile(
            path.join(WRITER_PLAYGROUND_ROOT_PATH, p),
            "utf-8"
          ),
        };
      })
    );
    return files;
  },
});

export const writerAgent = new Agent({
  name: "Writer",
  instructions: async () => {
    const files = globSync(
      path.join(WRITER_PLAYGROUND_ROOT_PATH, "**/*.md")
    ).map((f) => path.relative(WRITER_PLAYGROUND_ROOT_PATH, f));

    return `
    You are a writer agent.
    You can write text to files in a local directory.
    You write in markdown.

    ## File Structure

    When you write these files, keep them organized by encoding the date in the folder:
    - 2025-05-04/some-nice-name.md
    - 2025-05-05/some-other-name.md
    - 2025-05-06/yet-another-name.md

    ## Writing Style

    For work/personal emails, write extremely concisely, but in a friendly tone.
    Do not add email signatures.

    ## Personal Information

    My address is 81 Wootton Village, OX1 5HW.
    My phone number is 07712676946.
    My email is mattpocock@gmail.com.

    ## Files

    ${files.map((f) => `- ${f}`).join("\n")}
  `;
  },
  tools: {
    writeFile: writeFileTool,
    readFiles: readFilesTool,
  },
  model: anthropic("claude-3-5-sonnet-20240620"),
  memory: new Memory({
    options: {
      lastMessages: 10,
      semanticRecall: true,
    },
  }),
});
