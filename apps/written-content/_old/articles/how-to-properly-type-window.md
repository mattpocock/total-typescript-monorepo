# How to Add Types to Window

In pretty much any frontend application, you'll likely have encountered this error:

> Property 'X' does not exist on type 'Window & typeof globalThis'.

```ts twoslash
// @errors: 2339
window.X;
```

In this article, we'll lay out several different solutions to this issue.

## Quick Fix

The `Window` interface is defined globally in a file called `lib.dom.d.ts`. You _can_ change it using various techniques:

- To change it globally within a `.ts` or `.tsx` file, you can use `declare global` and `interface Window`:

```ts twoslash
export {};

// ---cut---
declare global {
  interface Window {
    X: number;
  }
}

window.X;
//     ^?
```

- To change it globally inside a `.d.ts` file, you can just specify `interface Window`.

```ts
interface Window {
  X: number;
}
```

- To change it for one file only, you can use `declare const window` in a `.ts` or `.tsx` file:

```ts twoslash
export {};

// ---cut---
declare const window: {
  X: number;
} & Window;

window.X;
//     ^?
```

## Explanation

The interface `Window` lives in the global scope in TypeScript. It ships as part of the DOM types in `lib.dom.d.ts`, which describes what methods are available in the browser.

The issue comes up when a third-party script (or perhaps our own code) adds something to the window:

```ts twoslash
export {};

declare const window: {
  X: number;
} & Window;

// ---cut---

window.X = Date.now();
```

This is a problem because TypeScript doesn't know about the `X` property, and so it throws an error when you try to access it:

```ts twoslash
// @errors: 2339
window.X;
```

So, we need to somehow change the global definition of `Window` to include the new property that TypeScript doesn't know about.

### Solution 1: `declare global` in a `.ts` or `.tsx` file

The first solution is to use `declare global` to change the global definition of `Window`:

```ts twoslash
export {};

// ---cut---

declare global {
  interface Window {
    X: number;
  }
}

window.X;
//     ^?
```

This works for two reasons. First, `declare global` tells TypeScript that anything inside it should be added to the global scope.

Second, we take advantage of [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces). This is a rule in TypeScript where interfaces with the _same name_ in the _same scope_ get _merged_. So by redeclaring `Window` in the same scope, we can append new properties to it.

This wouldn't work if we used `type` because types don't support declaration merging.

```ts twoslash
// @errors: 2300
export {};

// ---cut---

declare global {
  type Window = {
    X: number;
  };
}
```

This solution only works inside a `.ts` or `.tsx` file because `declare global` only works inside a module. So this solution is a little awkward in terms of _where_ you place the definition in your project. In its own module? Colocated with something else?

### Solution 2: A `.d.ts` file

A neater solution is to use `interface Window` in a `.d.ts` file:

```ts
// window.d.ts (choose any filename you like)

interface Window {
  X: number;
}
```

```ts twoslash
export {};

declare global {
  interface Window {
    X: number;
  }
}
// ---cut---
// your-app.ts
window.X;
//     ^?
```

This works because anything you place in a `.d.ts` _automatically_ goes into the global scope, so there's no need for `declare global`.

It also lets you place the global definition in a single file, on its own, which feels a little cleaner than trying to figure out which `.ts` file to put it in.

### Solution 3: Single-module override

If you're concerned about adding types into the global scope, you can use `declare const window` to override the type of `window` in a single module:

```ts twoslash
export {};

// ---cut---

declare const window: {
  X: number;
} & Window;

window.X;
//     ^?
```

`declare const window` acts like `const window`, but on the type level. So it only acts on the current scope — in this case, the module. We declare the type as the current `Window`, plus the new property `X`.

This solution gets a little annoying if you need to access `window.X` in multiple files because you'll need to add the `declare const window` line to each file.

### Which solution should I use?

Personally, I tend to reach for solution 2 — a `.d.ts` file. It's the fewest lines of code and the easiest to place in your project.

I don't mind adding types into the global scope. By actually changing the type of `Window`, you're more accurately describing the environment your code executes in. In my book, that's a bonus.

But if you're really concerned about it, use the `declare const` solution.
