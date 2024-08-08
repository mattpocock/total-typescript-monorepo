I'm starting to think that library types in TypeScript are all wrong.

Instead of top-level types, they should be available right on the functions that use them.

Brief thread 🧵

```ts twoslash
// @noErrors
import { Dispatch, SetStateAction } from "react";

type MyComponentProps = {
  // Complicated type, have to check
  // the docs to understand
  setIndex: Dispatch<SetStateAction<number>>;
};
```

```ts twoslash
// @noErrors
import { useState } from "react";

type MyComponentProps = {
  // Available right on the function
  setIndex: useState.Setter<number>;
};
```

---

How is this possible? Well, it's due to a trick in the way namespaces work in TypeScript.

When you export a namespace with the same name as a function, TypeScript combines the two:

```ts twoslash
export declare namespace myFunc {
  type MyType = string;
}

export const myFunc = (input: string) => {};

type Example = myFunc.MyType;
//                    ^?
```

---

This still works with 'import type', too:

```ts twoslash
// @filename: myFunc.ts
export declare namespace myFunc {
  type MyType = string;
}

export const myFunc = (input: string) => {};

type Example = myFunc.MyType;

// @filename: index.ts
// ---cut---

import type { myFunc } from "./myFunc";

type Example = myFunc.MyType;
//                    ^?
```

---

I wouldn't recommend this for application code - it's a bit too indirect.

But for libraries, it's an amazing DX improvement.

Library authors - please consider it!
