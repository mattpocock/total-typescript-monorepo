```ts twoslash
// @errors: 2345

// 1. Intersecting together two incompatible types
type Example = string & number;
//   ^?

// 2. A function that never returns
const neverReturns = () => {
  throw new Error("This function never returns");
};

const result = neverReturns();
//    ^?

// 3. Calling a union of functions with
// incompatible arguments
const fn1 = (input: string) => {};
const fn2 = (input: number) => {};

[fn1, fn2].forEach((fn) => fn("oops"));
```

```ts twoslash
type OnlySantaAllowed<
  T,
  K extends keyof T
> = "🎅🏼" extends T[K] ? K : never;

type ToNumber<T> = T extends `${infer V extends number}`
  ? V
  : never;

type FindSanta<T> = ToNumber<
  keyof {
    [K in keyof T as OnlySantaAllowed<T, K>]: K;
  }
>;
```
