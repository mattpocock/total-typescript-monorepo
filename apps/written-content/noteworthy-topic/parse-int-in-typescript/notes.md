```ts twoslash
type ParseInt<T extends string> =
  T extends `${infer Int extends number}` ? Int : never;

type Result = ParseInt<"123">;
//   ^?

type Result2 = ParseInt<"abc">;
//   ^?
```
