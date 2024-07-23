import { createReadStream } from "fs";
import path from "path";

const FILE_PATH = path.resolve(
  import.meta.dirname,
  "./big-file.txt",
);
const PHRASE_TO_FIND = "Variadic";

const fileContainsPhrase = async (filePath, phrase) => {
  const stream = createReadStream(filePath, "utf-8");

  let prevChunks = [];

  for await (const chunk of stream) {
    const accumulatedChunks = prevChunk.join("") + chunk;

    if (phrase.length > accumulatedChunks.length) {
      continue;
    }

    if (accumulatedChunks.includes(phrase)) {
      return true;
    }

    prevChunk = chunk;
  }
};

const result = await fileContainsPhrase(
  FILE_PATH,
  PHRASE_TO_FIND,
);

console.log(result);
