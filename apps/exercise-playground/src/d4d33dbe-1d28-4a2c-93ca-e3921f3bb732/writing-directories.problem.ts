// http://localhost:3004/courses/exercises/d4d33dbe-1d28-4a2c-93ca-e3921f3bb732/edit

import { expect, it } from "vitest";

const createDirectory = async (path: string) => {
  // TODO: Create a directory at the specified path
};

const createDirectoryRecursively = async (path: string) => {
  // TODO: Create a directory at the specified path, recursively
};

it("Should create a directory", async () => {
  const path = await import("path");

  const directoryPath = path.join(import.meta.dirname, "./output");

  // Delete the directory if it already exists, for the purposes
  // of this test
  const { rm } = await import("fs/promises");
  await rm(directoryPath, { recursive: true, force: true });

  await createDirectory(directoryPath);

  const { stat } = await import("fs/promises");

  await expect(stat(directoryPath)).resolves.toBeTruthy();
});

it("Should create a directory recursively", async () => {
  const path = await import("path");

  const directoryPath = path.join(import.meta.dirname, "./output-2/recursive");

  // Delete the directory if it already exists, for the purposes
  // of this test
  const { rm } = await import("fs/promises");
  await rm(directoryPath, { recursive: true, force: true });

  await createDirectoryRecursively(directoryPath);

  const { stat } = await import("fs/promises");

  await expect(stat(directoryPath)).resolves.toBeTruthy();
});
