```ts twoslash
// BEFORE
const arr = [1, "hello", 3, "world"];

const strings = arr.filter(
  // 1. Before 5.5, we need to manually type 'val is string'
  // to get the correct inference
  (val): val is string => typeof val === "string"
);
```

```ts twoslash
// AFTER
const arr = [1, "hello", 3, "world"];

const strings = arr.filter(
  // 2. With 5.5, TypeScript can infer the type
  // automatically
  (val) => typeof val === "string"
);
```
