A bizarre behaviour in TypeScript finally got fixed in 5.6.

You could import a file that doesn't exist, and TypeScript wouldn't complain.

But now, thanks to `noUncheckedSideEffectImports`, it errors!

Let me explain 🧵

```ts twoslash
// BEFORE: No error!

import "./does-not-exist";
```

```ts twoslash
// @errors: 2307
// @noUncheckedSideEffectImports: true
// AFTER: Errors!

import "./does-not-exist";
```

---

This behaviour only happens for 'side effect' imports.

These are imports where you don't care about the value, just the side effects it creates.

This is useful for `.css` imports, or polyfills.

```ts twoslash
import "./styles.css"; // CSS import
import "./my-polyfill"; // Polyfill import
```

---

But, if you import a file that doesn't exist, TypeScript should error.

And now, thanks to `noUncheckedSideEffectImports`, it does.

First, enable the flag in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "noUncheckedSideEffectImports": true
  }
}
```

---

Now, when you import a file that doesn't exist, TypeScript will error:

```ts twoslash
// @errors: 2307
// @noUncheckedSideEffectImports: true
import "./does-not-exist";
```

---

But what about those CSS imports? They shouldn't be erroring, but they still are:

```ts twoslash
// @errors: 2307
// @noUncheckedSideEffectImports: true
import "./styles.css";
```

---

To fix that, we need to tell TypeScript those files exist. The TS team recommend you do this with a `.d.ts` file.

```ts twoslash
// @noErrors
// ./src/globals.d.ts

// Recognize all CSS files as module imports.
declare module "*.css" {}
```

---

Now, TypeScript knows that these files exist, and won't error.

This is a much safer default, and leaves you exposed to fewer bugs.

I'll be adding this to my TSConfig Cheat Sheet very soon:

https://www.totaltypescript.com/tsconfig-cheat-sheet

---

And that's it! A small change, but a big improvement in TypeScript's safety.

Want more of these? I post all my threads to my newsletter so you never miss a thing:

https://www.totaltypescript.com/newsletter
