```ts twoslash
const createRoutes = <TRoutes extends string[]>(
  routes: TRoutes,
) => {
  return routes;
};

// Infers an array of strings,
// of any length
const routes = createRoutes(["home", "about", "contact"]);
//    ^?
```

```ts twoslash
const createRoutes = <TRoutes extends string[] | []>(
  routes: TRoutes,
) => {
  return routes;
};

// Infers the tuple instead!
const routes = createRoutes(["home", "about", "contact"]);
//    ^?
```

```ts twoslash
const createRoutes = <const TRoutes extends string[]>(
  routes: TRoutes,
) => {
  return routes;
};

// Infers the tuple instead!
const routes = createRoutes(["home", "about", "contact"]);
//    ^?
```
