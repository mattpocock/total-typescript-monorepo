```ts twoslash
// @verbatimModuleSyntax: true
// @module: NodeNext
// @moduleResolution: NodeNext

// @filename: foo.ts

const foo = 1;

export = { foo };

// @filename: bar.ts

import fooModule = require("./foo");
```
