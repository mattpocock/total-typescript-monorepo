---
music: true
---

```ts !!
// @noErrors
// Let's create a script that can remove
// zero-width spaces from a file.

// To handle any size of file, we'll
// need to use a stream pipeline.
```

```ts !!
// @noErrors
import { pipeline } from "node:stream";

// ---cut---
// First, let's create a stream pipeline.
pipeline();
```

```ts !!
// @noErrors
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream";

// ---cut---
// The first part of this pipeline will
// be a read stream, reading from 'input.txt'.
pipeline(createReadStream("input.txt"));
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline } from "node:stream";

// ---cut---
pipeline(
  createReadStream("input.txt"),
  // Next, we'll add a write stream to
  // write to an output file.
  createWriteStream("output.txt"),
);
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline } from "node:stream";

// ---cut---
pipeline(
  createReadStream("input.txt"),
  createWriteStream("output.txt"),
  // Finally, we can add a callback to
  // handle any errors that occur.
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  },
);
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline } from "node:stream";

// ---cut---
// But currently, our pipeline just
// reads from an input file and writes
// to an output file. It doesn't do
// anything in between.
pipeline(
  createReadStream("input.txt"),
  createWriteStream("output.txt"),
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  },
);
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline, Transform } from "node:stream";

// ---cut---
pipeline(
  createReadStream("input.txt"),
  // To fix that, let's add a transform
  // to the pipeline.
  new Transform({
    transform(chunk, encoding, callback) {},
  }),
  createWriteStream("output.txt"),
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  },
);
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline, Transform } from "node:stream";

// ---cut---
pipeline(
  createReadStream("input.txt"),
  new Transform({
    transform(chunk, encoding, callback) {
      // We'll turn each chunk into a string...
      const str = chunk.toString();
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
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline, Transform } from "node:stream";

// ---cut---
pipeline(
  createReadStream("input.txt"),
  new Transform({
    transform(chunk, encoding, callback) {
      const str = chunk.toString();

      // ...remove any zero-width spaces...
      const newStr = str.replace(/\u200B/g, "");
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
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline, Transform } from "node:stream";

// ---cut---
pipeline(
  createReadStream("input.txt"),
  new Transform({
    transform(chunk, encoding, callback) {
      const str = chunk.toString();

      const newStr = str.replace(/\u200B/g, "");

      // ...and write the new string to the output stream.
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
```

```ts !!
// @noErrors
import {
  createReadStream,
  createWriteStream,
} from "node:fs";
import { pipeline, Transform } from "node:stream";

// ---cut---
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
```
