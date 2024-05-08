```ts twoslash
type ReturnArrayIfExists<TUnion> = [any[]] extends [TUnion]
  ? Extract<TUnion, any[]>
  : TUnion;

type Example1 = ReturnArrayIfExists<string[]>;
//   ^?

type Example2 = ReturnArrayIfExists<string | string[]>;
//   ^?

type Example3 = ReturnArrayIfExists<number | string>;
//   ^?
```
