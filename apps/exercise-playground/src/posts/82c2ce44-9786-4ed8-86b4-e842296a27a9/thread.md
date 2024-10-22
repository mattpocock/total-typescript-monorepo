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
