https://twitter.com/TheRealP_YAN/status/1670005437372981249

```ts twoslash
const names = ["matt", "percy", "david"] as const;

type ToNumber<T extends PropertyKey> =
  T extends `${infer U extends number}`
    ? U
    : never;

type AllKeysOfNames = keyof typeof names;

type Indexes = ToNumber<AllKeysOfNames>;
```
