Lots of TS devs use arrays of unique values to avoid the pitfalls of enums.

But why not use a Set instead?

```ts twoslash
// BAD - uses an array, which can
// contain non-unique values...
const packStatus = [
  "draft",
  "approved",
  "shipped",
] as const;

// ...and uses .includes for checking,
// which is slow.
packStatus.includes("draft"); // true
```

```ts twoslash
// GOOD - uses Set!
const packStatus = new Set([
  "draft",
  "approved",
  "shipped",
] as const);

// You get the `has` method, which is
// faster than .includes.
packStatus.has("draft"); // true
```
