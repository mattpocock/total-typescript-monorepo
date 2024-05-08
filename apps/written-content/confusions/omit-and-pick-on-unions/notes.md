```ts twoslash
type Fruit = "apple" | "orange" | "lemon";

// No error, just a MASSIVE type:
type CitrusFruit = Omit<Fruit, "apple">;
//   ^?
```

```ts twoslash
type Fruit = "apple" | "orange" | "lemon";

type CitrusFruit = Exclude<Fruit, "apple">;
//   ^?
```
