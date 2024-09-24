// http://localhost:3004/courses/exercises/fe2c526a-f653-4af2-a32d-615aff87be82/edit

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

const inputFile = path.join(import.meta.dirname, "./input.txt");

// CALLBACKS
fs.readFile(
  inputFile,
  "utf-8",
  // This callback will be called when readFile is complete
  (err, data) => {
    if (err) {
      throw err;
    }

    console.log(data);
  }
);

// PROMISES
const dataAsync = await fsPromises.readFile(inputFile, "utf-8");

console.log(dataAsync);

// SYNC
const dataSync = fs.readFileSync(inputFile, "utf-8");

console.log(dataSync);
