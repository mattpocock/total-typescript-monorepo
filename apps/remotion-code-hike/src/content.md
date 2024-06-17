```ts !! dolor
type ToNumber<T extends PropertyKey> =
  T extends `${infer U extends number}` ? U : never;

type Example = ToNumber<"42">;
//   ^?
```

```ts !! dolor
type ToNumber<T extends PropertyKey> =
  T extends `${infer U extends number}` ? U : never;

type Example = ToNumber<"1000">;
//   ^?
```

```ts !! dolor
type ToNumber<T extends PropertyKey> =
  T extends `${infer U extends number}` ? U : never;

type Example = ToNumber<"fred">;
//   ^?
```
