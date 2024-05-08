```ts twoslash
// @moduleDetection: force

// 1. Add this to a global.ts file in your project
declare global {
  namespace NodeJS {
    interface ProcessEnv
      extends Record<string, undefined> {}
  }
}
```

```ts twoslash
import { z } from "zod";
// @errors: 2345
declare const process: {
  env: Record<string, undefined>;
};

const createApiClient = (base: string) => {};

// ---cut---

// 2. Now, accessing process.env no longer works...
const client = createApiClient(process.env.BASE_URL);
```

```ts twoslash
import { z } from "zod";
// @errors: 2345
declare const process: {
  env: Record<string, undefined>;
};

const createApiClient = (base: string) => {};

// ---cut---

const env = z
  .object({
    BASE_URL: z.string(),
  })
  .parse(process.env);

// 3. ...but accessing it from a parsed Zod object does!
const client = createApiClient(env.BASE_URL);
```
