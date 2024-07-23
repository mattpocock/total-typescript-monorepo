```ts twoslash
// @noErrors
import { createReadStream } from "node:fs";

// ---cut---
const fileContainsPhrase = async (filePath, phrase) => {
  const stream = createReadStream(filePath, "utf-8");

  let prevChunks = "";

  for await (const chunk of stream) {
    // 1. Scan two chunks at a time
    const accumulatedChunks = prevChunk + chunk;

    // 2. If the phrase is longer than the
    // accumulated chunks throw an error
    if (phrase.length > accumulatedChunks.length) {
      throw new Error("Phrase too long to find.");
    }

    // 2. Then check if the phrase is in the
    // accumulated chunks
    if (accumulatedChunks.includes(phrase)) {
      return true;
    }

    prevChunk = chunk;
  }
};
```
