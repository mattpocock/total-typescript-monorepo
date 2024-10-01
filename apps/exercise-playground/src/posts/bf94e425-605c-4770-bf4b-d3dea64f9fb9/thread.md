z.strict() fixed a nasty bug for me this morning.

You should probably be using it on most of the schemas that handle outside data.

Here's the bug 🧵

```ts twoslash
import { z } from "zod";

const schema = z
  .object({
    title: z.string(),
    postedAt: z.string().datetime().optional(),
  })
  // YOU LITTLE BEAUTY
  .strict();
```

---

I had a form where I was marking the date a post was posted. I was expecting a key of `postedAt`, with an optional datetime.

```ts twoslash
import { z } from "zod";

const schema = z.object({
  title: z.string(),
  postedAt: z.string().datetime().optional(),
});
```

---

Except, in my form, I had gotten the `name` field wrong:

```tsx twoslash
import "react";

// ---cut---
// `datePosted`, not `postedAt` - oh dear!

<input name="datePosted" />;
```

---

By default, Zod is happy to accept extra keys in the input. Those keys then get stripped from the output.

So, passing `datePosted` meant that changing the date on the frontend would never make it to the database.

```ts twoslash
import { z } from "zod";

const schema = z.object({
  title: z.string(),
  postedAt: z.string().datetime().optional(),
});

const output = schema.parse({
  title: "Hello",
  datePosted: "2021-01-01T00:00:00Z",
});

// No more `datePosted` key!
console.log(output); // { title: "Hello" }
```

---

The fix here is to make Zod warn me when I was passing excess keys by marking the schema as `strict`.

This makes sure any caller of your API is passing the right keys.

```ts twoslash
import { z } from "zod";

const schema = z
  .object({
    title: z.string(),
    postedAt: z.string().datetime().optional(),
  })
  .strict();

// Error! Unrecognized key(s) in object: 'datePosted'
const output = schema.parse({
  title: "Hello",
  datePosted: "2021-01-01T00:00:00Z",
});
```

---

I can think of way more cases where I'd want `strict` than not. I'm going to start adding it to all the schemas that handle outside data.

What do you think?

---

Want more juicy nuggets? I've got a newsletter:

https://www.totaltypescript.com/newsletter
