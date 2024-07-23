```ts twoslash
// @types: node
import { readFileSync } from "node:fs";

// ---cut---
const fileContainsPhrase = (
  filePath: string,
  phrase: string,
) => {
  // BAD - loads the entire file in memory with
  // readFileSync
  const fileContents = readFileSync(filePath, "utf-8");

  return fileContents.includes(phrase);
};
```

```ts twoslash
// @types: node
import { createReadStream } from "node:fs";

// ---cut---
const fileContainsPhrase = async (
  filePath: string,
  phrase: string,
) => {
  // GOOD - creates a read stream...
  const stream = createReadStream(filePath);

  // ...and reads the file in chunks...
  for await (const chunk of stream) {
    if (chunk.includes(phrase)) {
      // ...and returns early if found
      return true;
    }
  }
};
```
