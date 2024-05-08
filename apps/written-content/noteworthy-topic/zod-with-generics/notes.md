```ts twoslash
// @filename: safe-fn.ts
import { z } from "zod";

export const myAwesomeFunction = <TSchema extends z.Schema>(
  schema: TSchema,
  handle: (input: z.output<TSchema>) => void
) => {
  return (input: unknown) => handle(schema.parse(input));
};

// @filename: index.ts

// ---cut---

import { z } from "zod";
import { myAwesomeFunction } from "./safe-fn";

const schema = z.object({
  id: z.string(),
  name: z.string(),
});

// input is inferred from the schema!
myAwesomeFunction(schema, (input) => {});
//                          ^?
```

```ts twoslash
import { z } from "zod";

export const myAwesomeFunction = <TSchema extends z.Schema>(
  schema: TSchema,
  handle: (input: z.output<TSchema>) => void
) => {
  return (input: unknown) => handle(schema.parse(input));
};
```
