```ts nodeslash
// @types: node
import { mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

// 1. Grab the global directory for temporary files
// on this machine
const globalTmpDir = tmpdir();

// 2. Append a prefix to it so you can see which
// temporary directories are yours
const prefix = path.join(globalTmpDir, "playground-");

// 3. Create your temporary directory
const dir = await mkdtemp(prefix);

// 4. It'll append 6 random chars to the end of the
// prefix, like playground-abc123
console.log("Output:", dir);
```

```ts twoslash
// @types: node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// 1. Make a dir with 6 random characters
// in the current working directory
const dir1 = await fs.mkdtemp(process.cwd());

// 2. Add a prefix
const dir2 = await fs.mkdtemp(
  path.join(process.cwd(), "playground-"),
);

// 3. Add it to the global temporary directory
const dir3 = await fs.mkdtemp(
  path.join(os.tmpdir(), "playground-"),
);
```
