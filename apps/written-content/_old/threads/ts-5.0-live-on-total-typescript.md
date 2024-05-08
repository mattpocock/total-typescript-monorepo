# TypeScript 5.0 has landed!

TypeScript 5.0 has made it to Total TypeScript!

It brought a lot of improvements - you can learn all about it in our [5.0 breakdown](https://www.totaltypescript.com/tips/typescript-5-0-beta-deep-dive).

The most exciting feature for Total TypeScript was [const type parameters](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#const-type-parameters).

It lets you specify a type parameter as `const` - meaning that everything that gets passed to that parameter gets inferred as if it were `as const`.

```typescript
const routes = <const TRoutes>(
  routes: TRoutes
) => {
  return routes;
};

const myRoutes = routes({
  user: "/user",
  createUser: "/user/create",
});

Object.values(myRoutes); // ['/user', '/user/create']

// Before 5.0, myRoutes would be inferred as string[]
```

Before 5.0, you needed to use a hack in TypeScript to get this behaviour - the [F.Narrow](https://millsp.github.io/ts-toolbelt/modules/function_narrow.html) type helper from `ts-toolbelt`. I even taught this in Total TypeScript!

No longer - I've re-recorded 3 exercises in TT's [Advanced Patterns workshop](https://www.totaltypescript.com/workshops/advanced-typescript-patterns/identity-functions/identity-functions-as-an-alternative-to-the-as-const) to take advantage of const type annotations.

I can't wait to see what you build with them.
