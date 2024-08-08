# A New Proposal for Libary Types

I'm starting to think that library types in TypeScript are all wrong.

The typical way to handle library types is to have them available at the 'top level' of the module. React is a typical example:

```ts twoslash
// @noErrors
import { Dispatch, SetStateAction } from "react";

type MyComponentProps = {
  // Complicated type, have to check
  // the docs to understand
  setIndex: Dispatch<SetStateAction<number>>;
};
```

Here, we're preparing to pass the 'setter' of a `useState` hook to a component. But we have to use a relatively complicated type to do so, and import it from the top level of the module.

Instead, I think you should be able to grab the type from the function itself:

```ts twoslash
// @noErrors
import { useState } from "react";

type MyComponentProps = {
  // Available right on the function
  setIndex: useState.Setter<number>;
};
```

Now, the type is available right where the function is. You don't need to dive into the top level of the module to find it. This is a much better DX.

How is this possible? Well, it's due to a trick in the way namespaces work in TypeScript. When you export a namespace with the same name as a function, TypeScript combines the two:

```ts twoslash
export declare namespace myFunc {
  type MyType = string;
}

export const myFunc = (input: string) => {};

type Example = myFunc.MyType;
//                    ^?
```

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

I wouldn't recommend this for application code - it's a bit too indirect.

But for libraries, it's an amazing DX improvement.

Library authors - please consider it!
