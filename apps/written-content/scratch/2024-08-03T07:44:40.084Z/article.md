Here are 4 TSConfig options you HAVE to know about:

Let me explain 🧵

```json
{
  "compilerOptions": {
    // Make indexing stricter
    "noUncheckedIndexedAccess": true,

    // No accidental global scripts
    "moduleDetection": "force",

    // Every other "module" option is wrong
    "module": "NodeNext", // (or "Preserve")

    // Enforced 'type-only' imports
    "verbatimModuleSyntax": true
  }
}
```

---

`noUncheckedIndexedAccess` is by now pretty well known. Without it, TypeScript lets you stumble into some pretty nasty runtime errors.

For instance, the code below won't show an error, but will crash at runtime:

```ts twoslash
const obj: Record<string, string> = {};

obj.a.toUpperCase(); // No error!
```

---

This is because by default (even with `strict: true`), TypeScript will assume that any property in `obj` will be a string, even though it could be undefined at runtime.

```ts twoslash
const obj: Record<string, string> = {};

// 'string' in the types, but 'undefined' at runtime
console.log(obj.a);
//              ^?
```

---

But with `noUncheckedIndexedAccess`, we can get an error at compile time.

That's because TypeScript forces you to check if the property exists before accessing it.

```ts twoslash
// @errors: 18048
// @noUncheckedIndexedAccess: true
const obj: Record<string, string> = {};

console.log(obj.a.toUpperCase());
```

---

`moduleDetection: force` tells TypeScript that you have zero global scripts in your project.

Without it, TypeScript will treat files without imports and exports as global scripts.

This means you get odd errors when you try to declare variables that clash with the global scope:

```ts twoslash
// @moduleDetection: auto
// @errors: 2451
const window = {
  glazing: "double",
  heightInFeet: 4,
};
```

---

But with `moduleDetection: force`, it'll behave correctly.

It's an auto-include for any modern TS project.

```ts twoslash
// @moduleDetection: force
// No more weird error!
const window = {
  glazing: "double",
  heightInFeet: 4,
};
```

---

`module` is a setting with a BUNCH of different options. But really, there are only two modern options.

`NodeNext` tells TypeScript that your code will be run by Node.js.

This imposes some constraints, like needing to use specific `.js` extensions for files.

```ts twoslash
// @noErrors
// You MUST add the .js extension!
import { foo } from "./foo.js";
```

---

And `Preserve` tells TypeScript that an external bundler will handle the bundling.

This means you don't need to specify the `.js` extension.

```ts twoslash
// @noErrors
import { foo } from "./foo";
```

---

As a guide, you should use `NodeNext` when you're transpiling with `tsc`, and `Preserve` the rest of the time (like using a frontend framework, or a bundler like Rollup).

---

You can specify `moduleResolution` to be `Node`. This is a pretty common pattern.

But it's a terrible idea.

Many libraries use 'exports' in package.json to specify multiple entry points to their package. But 'Node' doesn't support this.

Kill it with fire wherever you see it:

```json
{
  "compilerOptions": {
    "moduleResolution": "Node" // BAD, do not use
  }
}
```

---

Finally, `verbatimModuleSyntax` makes TypeScript stricter with how you you use imports and exports.

In most cases, this will mean you'll be forced to use `import type` and `export type` instead of `import` and `export`.

```ts twoslash
// @errors: 1484
// @verbatimModuleSyntax: true
import { ComponentProps } from "react";
```

---

The way to fix this is to use `import type` instead.

Type-only imports are erased at runtime - and the fewer imports you have, the less runtime code will need to be handled by your bundler.

So, a setting to enforce them is pretty handy.

```ts twoslash
// No more error!
import type { ComponentProps } from "react";
```

---

If all of this feels bamboozling, you should check out my TSConfig Cheat Sheet.

I keep it updated with the latest changes to TSConfig, so you can rely on it.

https://www.totaltypescript.com/tsconfig-cheat-sheet
