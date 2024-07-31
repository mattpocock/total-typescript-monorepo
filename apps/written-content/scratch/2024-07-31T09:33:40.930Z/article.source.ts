// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline, Transform } from "node:stream";

// Now, our pipeline can read any size of file,
// remove all zero-width spaces, and write to
// an output file. Nice.
pipeline(
  createReadStream("input.txt"),
  new Transform({
    transform(chunk, encoding, callback) {
      const str = chunk.toString();

      const newStr = str.replace(/\u200B/g, "");

      callback(null, newStr);
    },
  }),
  createWriteStream("output.txt"),
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  },
);
