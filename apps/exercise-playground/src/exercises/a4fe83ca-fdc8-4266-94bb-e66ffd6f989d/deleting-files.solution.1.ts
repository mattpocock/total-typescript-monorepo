// http://localhost:3004/courses/exercises/a4fe83ca-fdc8-4266-94bb-e66ffd6f989d/edit

import { describe, expect, it } from "vitest";

import fs from "node:fs/promises";

const deleteFile = async (filePath: string) => {
  await fs.rm(filePath);
};

const deleteFileEvenIfitDoesNotExist = async (filePath: string) => {
  await fs.rm(filePath, {
    force: true,
  });
};

const deleteDirectory = async (filePath: string) => {
  await fs.rm(filePath, {
    force: true,
    recursive: true,
  });
};

describe("deleteFile", () => {
  it("Should delete a file", async () => {
    const path = await import("path");

    const filePath = path.join(import.meta.dirname, "./input.txt");

    // Set up the test
    const { writeFile } = await import("fs/promises");
    await writeFile(filePath, "Hello, world!");

    await deleteFile(filePath);

    // Expect the file not to exist
    const { stat } = await import("fs/promises");
    await expect(stat(filePath)).rejects.toThrow();
  });
});

describe("deleteFileEvenIfitDoesNotExist", () => {
  it("Should delete a file", async () => {
    const path = await import("path");

    const filePath = path.join(import.meta.dirname, "./input.txt");

    // Set up the test
    const { writeFile } = await import("fs/promises");
    await writeFile(filePath, "Hello, world!");

    await deleteFileEvenIfitDoesNotExist(filePath);

    // Expect the file not to exist
    const { stat } = await import("fs/promises");
    await expect(stat(filePath)).rejects.toThrow();
  });

  it("Should not throw when deleting a file which does not exist", async () => {
    const path = await import("path");

    const filePath = path.join(import.meta.dirname, "./does-not-exist.txt");

    // Expect it not to throw even though the file does not exist
    await expect(
      deleteFileEvenIfitDoesNotExist(filePath)
    ).resolves.not.toThrow();
  });
});

describe("deleteDirectory", () => {
  it("Should delete a directory", async () => {
    const path = await import("path");

    const filePath = path.join(import.meta.dirname, "./input-dir");

    // Set up the test
    const { mkdir, writeFile } = await import("fs/promises");
    await mkdir(filePath, { recursive: true });
    await writeFile(path.join(filePath, "file.txt"), "Hello, world!");

    await deleteDirectory(filePath);

    // Expect the directory not to exist
    const { stat } = await import("fs/promises");
    await expect(stat(filePath)).rejects.toThrow();
  });
});
