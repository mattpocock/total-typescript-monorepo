// http://localhost:3004/courses/exercises/b6700149-9fa8-400c-989a-8a89c9939d87/edit

import fs from "node:fs/promises";
import path from "node:path";
import { expect, it } from "vitest";

const inputFile = path.join(import.meta.dirname, "./input.jpg");
const outputFile = path.join(import.meta.dirname, "./output.jpg");

// Clean up the output file before running the exercise
await fs.rm(path.join(import.meta.dirname, "./output.jpg"), {
  force: true,
});

const inputBuffer = await fs.readFile(inputFile);

it("Should be a buffer containing an image file of 14 kilobytes", async () => {
  expect(inputBuffer.length).toEqual(14367); // amount of bytes in the image!
});

await fs.writeFile(outputFile, inputBuffer);

it("Should write the new file as a buffer that equals the first buffer", async () => {
  const outputFileContents = await fs.readFile(outputFile);

  expect(outputFileContents).toEqual(inputBuffer);
});
