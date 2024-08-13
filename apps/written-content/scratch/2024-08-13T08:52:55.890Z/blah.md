```ts twoslash
// 1. Create a set with the values of the enum
const packStatus = new Set([
  "draft",
  "approved",
  "shipped",
] as const);

// 2. Create a type helper to grab the
// type from the Set
type TypeFromSet<T extends Set<any>> =
  T extends Set<infer U> ? U : never;

// 3. Grab the type from the Set
type PackStatus = TypeFromSet<typeof packStatus>;
//   ^?
```
