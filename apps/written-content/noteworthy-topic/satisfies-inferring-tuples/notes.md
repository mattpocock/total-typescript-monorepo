---
posted: 2024-06-18
---

```ts twoslash
// @errors: 2493
// 1. We declare a type that represents an array
// with at least one member...
type InferAsTuple = [unknown, ...unknown[]];

// 2. We use it to type an array...
const options = [
  { label: "View", value: "VIEW" },
  { label: "Full access", value: "FULL_ACCESS" },
] satisfies InferAsTuple;

// 3. And we get an error when we access
// an index that doesn't exist!
console.log(options[2]);
```
