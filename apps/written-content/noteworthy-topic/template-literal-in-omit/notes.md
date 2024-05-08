```ts twoslash
type Handlers = keyof HTMLElement & `on${string}`;

type Obj = Record<Handlers, any>;
//   ^?
```
