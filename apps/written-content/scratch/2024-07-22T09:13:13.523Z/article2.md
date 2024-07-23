```ts twoslash
// @types: node
const fs = require("fs");

// Perfectly legal!
fs.readFileSync = undefined;
```

```ts twoslash
// @types: node
import * as fs from "fs";

// @errors: 2540
fs.readFileSync = undefined;
```
