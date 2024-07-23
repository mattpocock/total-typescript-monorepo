import { readFileSync } from "fs";
import path from "path";

const FILE_PATH = path.resolve(
  import.meta.dirname,
  "./big-file.txt",
);
const PHRASE_TO_FIND = "Variadic";

const fileContainsPhrase = (filePath, phrase) => {
  const fileContents = readFileSync(filePath, "utf-8");

  return fileContents.includes(phrase);
};

const result = fileContainsPhrase(
  FILE_PATH,
  PHRASE_TO_FIND,
);

console.log(result);
