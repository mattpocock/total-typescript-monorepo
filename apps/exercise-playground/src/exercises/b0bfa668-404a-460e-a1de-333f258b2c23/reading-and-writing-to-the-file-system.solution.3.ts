// http://localhost:3004/courses/exercises/b0bfa668-404a-460e-a1de-333f258b2c23/edit

import { expect, it } from "vitest";
import fs from "fs";

const writeFileToFileSystem = (path: string, contents: string) => {
  return fs.writeFileSync(path, contents);
};

const readFileFromFileSystem = (path: string) => {
  const buffer = fs.readFileSync(path);

  return buffer.toString();
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
