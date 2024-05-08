```ts twoslash
type A = {
  a: string;
  b: string;
};

type B = {
  c: string;
};

type Example = keyof (A | B);
//   ^?
```

```ts twoslash
type A = {
  a: string;
  b: string;
};

type B = {
  c: string;
};

// ---cut---
type KeyofUnion<T> = T extends any
  ? keyof T
  : never;

type Example = KeyofUnion<
  // ^?
  A | B
>;
```
