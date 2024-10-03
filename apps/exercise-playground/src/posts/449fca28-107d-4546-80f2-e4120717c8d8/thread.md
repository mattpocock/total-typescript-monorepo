```ts twoslash
// @types: node
if (!process.env.DATABASE_URL?.includes("localhost")) {
  throw new Error("DATABASE_URL is not targeting localhost");
}
```
