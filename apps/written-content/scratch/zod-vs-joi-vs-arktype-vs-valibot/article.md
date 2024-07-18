---
width: 1080
height: 1080
musicFullVolume: true
slideDuration: 309
---

```ts !!
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

// { email: 'matt@example.com' }
schema.parse({
  email: "matt@example.com",
});

// Throws an error
schema.parse({
  email: "not an email",
});
```

```ts !!
import * as v from "valibot";

const schema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
  ),
});

// { email: 'matt@example.com' }
v.parse(schema, {
  email: "matt@example.com",
});

// Throws an error
v.parse(schema, {
  email: "not an email",
});
```

```ts !!
import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email(),
});

// { email: 'matt@example.com' }
schema.validate({
  email: "matt@example.com",
}).value;

// Doesn't throw, but
// returns ValidationError
schema.validate({
  email: "not an email",
}).error;
```

```ts !!
import {
  ArkError,
  type,
} from "arktype";

const schema = type({
  email: "email",
});

// { email: 'matt@example.com' }
schema({
  email: "matt@example.com",
});

// Doesn't throw, but
// returns ArkError[]
schema({
  email: "not an email",
});
```
