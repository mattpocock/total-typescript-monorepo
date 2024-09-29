// http://localhost:3004/courses/exercises/b0bfa668-404a-460e-a1de-333f258b2c23/edit

import { expect, it } from "vitest";

const writeFileToFileSystem = async (path: string, contents: string) => {
  // TODO: Write the contents to the file system at the specified path
};

const readFileFromFileSystem = async (path: string) => {
  // TODO: Read the contents from the file system at the specified path
};

it("should write and read from the file system", async () => {
  const path = await import("path");

  const filePath = path.join(import.meta.dirname, "./output.txt");
  const contents = "Hello, world!";

  // Delete the file if it already exists, for the purposes
  // of this test
  const { rm } = await import("fs/promises");
  await rm(filePath, { force: true, recursive: true });

  await writeFileToFileSystem(filePath, contents);

  const readContents = await readFileFromFileSystem(filePath);

  expect(readContents).toBe(contents);
});
