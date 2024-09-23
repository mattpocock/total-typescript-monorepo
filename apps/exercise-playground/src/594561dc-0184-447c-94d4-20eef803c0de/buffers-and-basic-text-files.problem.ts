// http://localhost:3004/courses/exercises/594561dc-0184-447c-94d4-20eef803c0de/edit

import fs from "node:fs/promises";
import path from "node:path";
import { expect, it } from "vitest";

const inputFile = path.join(import.meta.dirname, "./input.txt");
const outputFile = path.join(import.meta.dirname, "./output.txt");

// Clean up the output file before running the exercise
await fs.rm(path.join(import.meta.dirname, "./output.txt"), { force: true });

const inputBuffer = null; // TODO: Read the file as a buffer

it('Should be a buffer containing "abc"', () => {
  expect(inputBuffer.length).toBe(3);
  expect(inputBuffer.toString()).toBe("abc");
});

// TODO: Write the input buffer to the output file

it("Should write the new file as a buffer", async () => {
  const outputFileContents = await fs.readFile(outputFile, "utf-8");

  expect(outputFileContents).toBe("abc");
});
