# How To strongly Type process.env

A common problem in TypeScript is that `process.env` doesn't give you autocomplete for the environment variables that actually exist in your system:

```ts twoslash
declare const process: {
  env: Record<string, string | undefined>;
};

// ---cut---

console.log(process.env.MY_ENV_VARIABLE); // No autocomplete
```

They also end up typed as `string | undefined`, which can be annoying if you're passing them into functions that expect a string:

```ts twoslash
// @errors: 2345
declare const process: {
  env: Record<string, string | undefined>;
};

// ---cut---

const myFunc = (envVar: string) => {
  console.log(envVar.toUpperCase());
};

myFunc(process.env.MY_ENV_VARIABLE);
```

Here are a few ways to strongly type `process.env`:

## Solution 1: Augment The Global Type

You can augment the global type `NodeJS.ProcessEnv` to include your environment variables:

```ts
// globals.d.ts
namespace NodeJS {
  interface ProcessEnv {
    MY_ENV_VARIABLE: string;
  }
}
```

This relies on declaration merging on the global interface `NodeJS.ProcessEnv`, adding an extra property `MY_ENV_VARIABLE`.

Now, in every file in your project, you'll get autocomplete for `MY_ENV_VARIABLE`, and it'll be typed as a string.

```ts twoslash
// @errors: 2345
declare const process: {
  env: {
    MY_ENV_VARIABLE: string;
  };
};

const myFunc = (envVar: string) => {
  console.log(envVar.toUpperCase());
};

// ---cut---

myFunc(process.env.MY_ENV_VARIABLE);
//                 ^?
```

However, this doesn't provide any guarantees that the environment variable actually exists in your system.

This means that it's useful when you have relatively few environment variables, or can't get buy-in to add an extra library for checking them.

## Solution 2: Validate It At Runtime With `t3-env`

If you want to validate that all your environment variables are present at runtime, you can use a library like [`t3-env`](https://github.com/t3-oss/t3-env).

This leverages zod to validate your environment variables at runtime. Here's an example:

```ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },
  clientPrefix: "PUBLIC_",
  client: {
    PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
```

This will fail at runtime if any of the environment variables are missing or don't match the schema. It also means you can leverage Zod's powerful validation capabilities, such as `.url()` or `.min(1)` for strings.

It also provides a single source of truth for your environment variables - `env`. This means you can use `env` throughout your codebase, and you'll get autocomplete and type-checking for your environment variables.

Here's a [great guide](https://env.t3.gg/docs/core) you can use to get started.

## Which Solution Should You Use?

If your project is small and you don't want to add extra dependencies, augmenting the global type is a good solution.

But if you're remotely concerned about missing environment variables at runtime, `t3-env` is a great choice.
