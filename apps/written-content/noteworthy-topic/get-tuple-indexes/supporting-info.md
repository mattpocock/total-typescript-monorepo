---
lastPosted: 2024-06-14
---

https://twitter.com/TheRealP_YAN/status/1670005437372981249

```ts twoslash
// CODE

/**
 * Coerces a string, number or symbol into a number
 */
type ToNumber<T extends PropertyKey> =
  T extends `${infer U extends number}` ? U : never;

/**
 * Returns the indexes of an array
 */
type IndexesOfArray<T extends readonly any[]> = ToNumber<
  keyof T
>;
```

```ts twoslash
type IndexesOfArray<T extends readonly any[]> = ToNumber<
  keyof T
>;

type ToNumber<T extends PropertyKey> =
  T extends `${infer U extends number}` ? U : never;
// ---cut---
// USAGE

const names = ["matt", "percy", "david"] as const;

type NameIndexes = IndexesOfArray<typeof names>;
//   ^?
```
