// http://localhost:3004/courses/exercises/dafff30d-44a0-4d9b-b507-1189539c514a/edit

import { expect, it } from "vitest";

import fs from "node:fs";

const moveFile = (source: string, destination: string) => {
  fs.renameSync(source, destination);
};

const moveDirectory = (source: string, destination: string) => {
  fs.renameSync(source, destination);
};

it("Should move a file", async () => {
  const path = await import("path");

  const source = path.join(import.meta.dirname, "./input.txt");
  const destination = path.join(import.meta.dirname, "./output.txt");

  // Set up the test
  const { rm, writeFile } = await import("fs/promises");
  await writeFile(source, "Hello, world!");
  await rm(destination, { force: true, recursive: true });

  await moveFile(source, destination);

  // Expect the destination file to exist
  const { stat } = await import("fs/promises");
  await expect(stat(destination)).resolves.toBeTruthy();
});

it("Should move a directory", async () => {
  const path = await import("path");

  const source = path.join(import.meta.dirname, "./input-dir");
  const destination = path.join(import.meta.dirname, "./output-dir");

  // Set up the test
  const { rm, mkdir, writeFile } = await import("fs/promises");
  await mkdir(source, { recursive: true });
  await writeFile(path.join(source, "file.txt"), "Hello, world!");
  await rm(destination, { recursive: true, force: true });

  await moveDirectory(source, destination);

  // Expect the destination directory to exist
  const { stat } = await import("fs/promises");
  await expect(stat(destination)).resolves.toBeTruthy();
});
