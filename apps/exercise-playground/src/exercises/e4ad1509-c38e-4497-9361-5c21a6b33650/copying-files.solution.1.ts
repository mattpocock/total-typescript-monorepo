// http://localhost:3004/courses/exercises/e4ad1509-c38e-4497-9361-5c21a6b33650/edit

import { expect, it } from "vitest";

import fs from "node:fs/promises";

const copyFile = async (source: string, destination: string) => {
  await fs.cp(source, destination);
};

const copyDirectory = async (source: string, destination: string) => {
  await fs.cp(source, destination, { recursive: true });
};

it("Should copy a file", async () => {
  const path = await import("path");

  const source = path.join(import.meta.dirname, "./input.txt");
  const destination = path.join(import.meta.dirname, "./output.txt");

  // Delete the file if it already exists, for the purposes
  // of this test
  const { rm } = await import("fs/promises");
  await rm(destination, { force: true, recursive: true });

  await copyFile(source, destination);

  // Expect the destination file to exist
  const { stat } = await import("fs/promises");
  await expect(stat(destination)).resolves.toBeTruthy();
});

it("Should copy a directory", async () => {
  const path = await import("path");

  const source = path.join(import.meta.dirname, "./input-dir");
  const destination = path.join(import.meta.dirname, "./output-dir");

  // Delete the directory if it already exists, for the purposes
  // of this test
  const { rm } = await import("fs/promises");
  await rm(destination, { recursive: true, force: true });

  await copyDirectory(source, destination);

  // Expect the destination directory to exist
  const { stat } = await import("fs/promises");
  await expect(stat(destination)).resolves.toBeTruthy();
});
