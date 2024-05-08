# The TypeScript 5.3 Feature They Didn't Tell You About

TypeScript 5.3 was released last week.

As usual, I scanned the [announcement post](https://devblogs.microsoft.com/typescript/announcing-typescript-5-3/), but I quickly noticed something interesting.

One of the most important changes in TypeScript 5.3 wasn't mentioned in the release notes.

TypeScript has relaxed the rules around readonly arrays.

The `satisfies` keyword now lets you pass in readonly arrays:

```ts twoslash
// This would error in 5.2, but is allowed in 5.3!
const array = ["a", "b", "c"] as const satisfies string[];
//    ^?
```

And `const` type parameters now infer the type passed in instead of defaulting to their constraints:

```ts twoslash
const returnWhatIPassIn = <const T extends any[]>(t: T) => {
  return t;
};

// result is any[] in TS 5.2, but ['a', 'b', 'c'] in 5.3
const result = returnWhatIPassIn(["a", "b", "c"]);
//    ^?
```

If you want more info, you can check out [my article on Total TypeScript](https://totaltypescript.com/the-typescript-5-3-feature-they-didn-t-tell-you-about).
