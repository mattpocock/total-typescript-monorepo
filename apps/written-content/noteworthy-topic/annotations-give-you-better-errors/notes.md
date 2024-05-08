```ts twoslash
// @errors: 2345

// BEFORE - mega error far away from the error site

const routingConfig = {
  routes: [
    {
      path: "about",
      component: 12,
    },
  ],
};

const createRoutes = (config: {
  routes: {
    path: string;
    component: string;
  }[];
}) => {};

createRoutes(routingConfig);
```

```ts twoslash
// @errors: 2345
const routingConfig = {
  routes: [
    {
      path: "about",
      component: 12,
    },
  ],
};

type Route = {
  path: string;
  component: string;
};

type RouteConfig = {
  routes: Route[];
};

const createRoutes = (config: RouteConfig) => {};

createRoutes(routingConfig);
```

```ts twoslash
// @errors: 2322

// AFTER - tiny error exactly where you need it

type Route = {
  path: string;
  component: string;
};

type RouteConfig = {
  routes: Route[];
};

const routingConfig: RouteConfig = {
  routes: [
    {
      path: "about",
      component: 12,
    },
  ],
};
```
