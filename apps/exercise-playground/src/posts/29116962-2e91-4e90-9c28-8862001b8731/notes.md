# Notes

http://localhost:3004/posts/29116962-2e91-4e90-9c28-8862001b8731/edit

https://x.com/robpalmer2/status/1839792589190451605

https://github.com/microsoft/TypeScript/pull/59767

```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
```

```ts twoslash
import ts from "./a.ts"; // YES
import tsx from "./b.tsx"; // YES
import mts from "./c.mts"; // YES
import mtsx from "./d.mtsx"; // YES
import cts from "./e.cts"; // YES
import ctsx from "./f.ctsx"; // YES

await import("./a.ts"); // YES
require("./a.ts"); // YES

import a from "./a"; // NO, no extension
import b from "./b.d.ts"; // NO, targets .d.ts file
```
