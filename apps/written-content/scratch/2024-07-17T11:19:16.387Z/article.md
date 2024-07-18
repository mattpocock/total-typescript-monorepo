---
width: 1080
height: 1080
music: true
---

```ts !!
import { z } from "zod";

const schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

type Schema = z.infer<typeof schema>;
//   ^?
```

```ts !!
import { z } from "zod";

const schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

type Schema = z.output<typeof schema>;
//   ^?
```

```ts !!
import * as v from "valibot";

const schema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.string(),
});

type Schema = v.InferOutput<typeof schema>;
//   ^?
```

```ts !!
import { type } from "arktype";

const schema = type({
  id: "uuid",
  name: "string",
});

type Schema = typeof schema.infer;
//   ^?
```
