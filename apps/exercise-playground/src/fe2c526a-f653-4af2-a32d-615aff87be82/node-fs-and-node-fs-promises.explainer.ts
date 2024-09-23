// http://localhost:3004/courses/exercises/fe2c526a-f653-4af2-a32d-615aff87be82/edit

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { expect, it } from "vitest";

const inputFile = path.join(import.meta.dirname, "./input.txt");

it("Should handle reading a file with a callback API", () =>
  new Promise<void>((done) => {
    fs.readFile(
      inputFile,
      "utf-8",
      // This callback will be called when readFile is complete
      (err, data) => {
        if (err) {
          throw err;
        }

        expect(data).toBe("Hello, world!");
        done();
      }
    );
  }));

it("Should handle reading a file with async/await", async () => {
  const data = await fsPromises.readFile(inputFile, "utf-8");
  expect(data).toBe("Hello, world!");
});
