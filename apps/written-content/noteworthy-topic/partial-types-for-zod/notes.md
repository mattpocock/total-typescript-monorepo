```ts twoslash
// BEFORE

import { z } from "zod";

// 1. Has a dependency on Zod's internals, and can't
// be easily refactored to use a different library
declare const fetchWithSchema: <T extends z.ZodSchema>(
  url: string,
  schema: T
) => Promise<z.output<T>>;
```

```ts twoslash
// AFTER

declare const fetchWithSchema: <T>(
  url: string,
  // 2. Much simpler, and no zod dependency
  schema: {
    parse: (value: unknown) => T;
  }
) => Promise<T>;
```

```ts twoslash
declare const fetchWithSchema: <T>(
  url: string,
  // 2. Declaring only what we need is much
  // simpler, and drops the zod dependency
  schema: {
    parse: (value: unknown) => T;
  }
) => Promise<T>;

// ---cut---

// DEMO

import { z } from "zod";

fetchWithSchema(
  "https://example.com/api/user",
  z.object({
    id: z.number(),
  })
).then((res) => {
  // 3. Still works!
  console.log(res);
  //          ^?
});
```
