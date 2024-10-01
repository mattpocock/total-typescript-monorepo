Turns out I was totally off-base with a post I made last week.

You'll never need to write a `.js` import again, thanks to this new flag in TS 5.7.

The TS team changed their mind. This is massive.

🧵

```ts twoslash
// @noErrors
// WHY DO I NEED TO USE A .JS EXTENSION HERE? GRAH

import ts from "./my-file.js";
```

---

This is the flag you'll need to add to your `tsconfig.json`.

This rewrites relative `.ts` extensions to `.js` extensions when you use `tsc` to bundle your code. You'll also need `allowImportingTsExtensions`:

```json
{
  "compilerOptions": {
    // New flag!
    "rewriteRelativeImportExtensions": true,
    // Also needed:
    "allowImportingTsExtensions": true
  }
}
```

---

You might ask, why didn't it always work this way?

Well, TS was adamant about not changing runtime behaviour. Changing a `.ts` import to a `.js` import is a runtime change. TS prefers to think of itself these days as just "JavaScript with types".

So, I'm kind of shocked that they changed their mind.

---

Personally, I've been pretty happy with these `.js` extensions. I compile my code with `tsc` and run it with Node.

I like knowing that the file path I'm seeing is the file path that Node is using.

BUT, this is extremely confusing for beginners.

```ts twoslash
// @noErrors
// Beginners, prepare to get confused.

import ts from "./my-ts-file.js";
```

---

So, here's a big list of all the transformations that will be targeted with this flag:

If it's got an extension, it'll be transformed (YES). But if it targets a .d.ts file, or it's a non-relative import, it won't be transformed (NO).

```ts twoslash
// @noErrors
import ts from "./a.ts"; // YES
import tsx from "./b.tsx"; // YES
import mts from "./c.mts"; // YES
import mtsx from "./d.mtsx"; // YES
import cts from "./e.cts"; // YES
import ctsx from "./f.ctsx"; // YES

await import("./a.ts"); // YES
require("./a.ts"); // YES

import a from "./a"; // NO, no extension
import b from "./b.d.ts"; // NO, targets .d.ts file
import c from "~/c.ts"; // NO, non-relative import
```

---

Here's the PR where it landed.

What do you think? Excited about this flag?

https://github.com/microsoft/TypeScript/pull/59767

---

I'm pretty sure this will end up in my recommended TSConfig Cheat Sheet for when you're transpiling with tsc.

Hard to see this as anything other than a massive improvement.

https://www.totaltypescript.com/tsconfig-cheat-sheet

---

Want to stay up to date with TS? I've got a newsletter for that.

Get your dirty paws on it:

https://www.totaltypescript.com/newsletter
