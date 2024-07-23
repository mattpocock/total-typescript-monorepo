```ts twoslash
// @noErrors
import { syncBuiltinESMExports } from "node:module";
import * as fs from "node:fs";

// 1. First, we mock readFileSync...
fs.readFileSync = () => "mocked-contents";

// 2. Prints 'mocked-contents'
console.log(fs.readFileSync("some-file.txt", "utf8"));

// But after re-syncing the built-in ESM exports...
syncBuiltinESMExports();

// Prints whatever some-file.txt contains.
console.log(fs.readFileSync("some-file.txt", "utf8"));
```
