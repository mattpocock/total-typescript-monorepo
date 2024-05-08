```ts twoslash
type Obj = Pick<
  // ^?
  HTMLElement,
  keyof HTMLElement & `on${string}`
>;
```
