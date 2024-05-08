```ts twoslash
// @target: esnext
type WidenLiteral<T> = T extends string | number | boolean
  ? ReturnType<T["valueOf"]>
  : T;

type Example1 = WidenLiteral<"abc">;
//   ^?

type Example2 = WidenLiteral<true>;
//   ^?

type Example3 = WidenLiteral<"abc" | 100>;
//   ^?

// If it's not a literal, return it as-is!
type Example4 = WidenLiteral<{
  // ^?
  a: string;
}>;
```
