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
