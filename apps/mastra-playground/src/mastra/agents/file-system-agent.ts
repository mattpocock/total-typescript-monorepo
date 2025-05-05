import { anthropic } from "@ai-sdk/anthropic";
import { Agent, createTool } from "@mastra/core";
import { Memory } from "@mastra/memory";
import { env } from "@total-typescript/env";
import { glob, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const REPOS_ROOT_DIRECTORY = "/home/mattpocock/repos";

const allowedRoots = {
  dropbox: env.DROPBOX_DIRECTORY,
  longTermFootageStorage: env.LONG_TERM_FOOTAGE_STORAGE_DIRECTORY,
  obsOutput: env.OBS_OUTPUT_DIRECTORY,
  desktop: `/mnt/c/Users/mpoco/Desktop`,
  aiHeroRepo: path.join(REPOS_ROOT_DIRECTORY, "ai/ai-hero"),
  planning: path.join(REPOS_ROOT_DIRECTORY, "matt/planning"),
};

const rootEnum = z.enum(
  Object.keys(allowedRoots) as [
    keyof typeof allowedRoots,
    ...(keyof typeof allowedRoots)[],
  ]
);

const createFileSystemTools = () => {
  return {
    readdir: createTool({
      description: "Read the contents of a directory",
      id: "readdir",
      inputSchema: z.object({
        root: rootEnum,
        dir: z.string(),
      }),
      execute: async ({ context }) => {
        try {
          const files = await glob(
            path.join(
              allowedRoots[context.root],
              context.dir,
              "**/*.{md,ts,tsx,json,mkv,txt,mp4,mov}"
            ),
            {
              cwd: allowedRoots[context.root],
              exclude: (file) => {
                return file.includes("node_modules") || file.includes(".git");
              },
            }
          );

          return Array.fromAsync(files);
        } catch (error) {
          return `Error reading directory: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
    readFiles: createTool({
      description:
        "Read the contents of multiple files. Only use for non-binary files, like text files.",
      id: "readFiles",
      inputSchema: z.object({
        files: z.array(z.string()),
        root: rootEnum,
      }),
      execute: async ({ context }) => {
        try {
          const fileContents = await Promise.all(
            context.files.map(async (file) => ({
              path: file,
              content: await readFile(
                path.join(allowedRoots[context.root], file),
                "utf-8"
              ),
            }))
          );
          return fileContents;
        } catch (error) {
          return `Error reading files: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
    writeFile: createTool({
      description: "Write to a file",
      id: "writeFile",
      inputSchema: z.object({
        file: z.string(),
        content: z.string(),
        root: rootEnum,
      }),
      execute: async ({ context }) => {
        try {
          await writeFile(
            path.join(allowedRoots[context.root], context.file),
            context.content
          );

          return `File ${context.file} written to ${allowedRoots[context.root]}`;
        } catch (error) {
          return `Error writing file: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
    mkdir: createTool({
      description: "Create a directory",
      id: "mkdir",
      inputSchema: z.object({
        dir: z.string(),
        root: rootEnum,
      }),
      execute: async ({ context }) => {
        try {
          await mkdir(path.join(allowedRoots[context.root], context.dir), {
            recursive: true,
          });

          return `Directory ${context.dir} created in ${allowedRoots[context.root]}`;
        } catch (error) {
          return `Error creating directory: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
    rm: createTool({
      description: "Remove multiple files or directories",
      id: "rm",
      inputSchema: z.object({
        files: z.array(z.string()),
        root: rootEnum,
      }),
      execute: async ({ context }) => {
        try {
          await Promise.all(
            context.files.map((file) =>
              rm(path.join(allowedRoots[context.root], file), {
                recursive: true,
              })
            )
          );

          return `Files removed from ${allowedRoots[context.root]}`;
        } catch (error) {
          return `Error removing files: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
    rename: createTool({
      description: "Rename a file or directory",
      id: "rename",
      inputSchema: z.object({
        oldPath: z.string(),
        newPath: z.string(),
        root: rootEnum,
      }),
      execute: async ({ context }) => {
        try {
          await rename(
            path.join(allowedRoots[context.root], context.oldPath),
            path.join(allowedRoots[context.root], context.newPath)
          );

          return `File ${context.oldPath} renamed to ${context.newPath} in ${allowedRoots[context.root]}`;
        } catch (error) {
          return `Error renaming file: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
  };
};

export const fileSystemAgent = new Agent({
  model: anthropic("claude-3-5-sonnet-latest"),
  instructions: `You are a helpful assistant that can help with tasks related to the file system.

  You have access to several possible roots:
  - Dropbox: where files can be stored to be synced to the AI Hero team
  - Long Term Footage Storage: where files can be stored to be used for long term storage
  - OBS Output: where files can be stored from OBS
  - Davinci Export: where completed videos can be stored from Davinci Resolve
  - AI Hero Repo: where the AI Hero codebase is stored, including the material for the course
  - Planning: where Matt's planning documents are stored

  Matt is current working on a DeepSearch in TypeScript course in the AI Hero Repo.
  This is under ./courses/01-deepsearch-in-typescript.

  The current plan document is found at planning/projects/main.md.
  This will be very useful 

  You can use the following tools to help you:
  - readdir
  - readFile
  - writeFile
  - mkdir
  - rm
  - rename`,
  name: "File System",
  memory: new Memory({
    options: {
      lastMessages: 10,
      semanticRecall: true,
    },
  }),
  tools: createFileSystemTools(),
});
