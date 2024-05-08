could not find declaration file for module

Reasons this error can occur:

1. The import statement you've written points to the wrong file.

Let's say you've renamed or moved a file, but you haven't updated the import statement. TypeScript will complain that it can't find the module.

Here, it'll complain:

> Cannot find module './utils' or its corresponding type declarations.

```ts twoslash
// @errors: 2307
// @filename: not-here.ts

export const myUtility = () => {};

// @filename: other.ts

// ---cut---

// './utils' doesn't exist!
import { myUtility } from "./utils";
```

2. The import statement you've written is using the wrong extension.

```ts twoslash
// @errors: 2307
// @filename: utils.ts
// @moduleResolution: Node16
// @module: Node16

export const myUtility = () => {
  return 123;
};

// @filename: other.ts

// ---cut---

import { myUtility } from "./utils.js";
```
