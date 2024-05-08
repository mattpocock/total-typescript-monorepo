# What's coming to TypeScript 5.2?

TypeScript 5.2 is coming out soon, and it's bringing some exciting new features. Let's take a look at what's coming.

At the time of writing, TypeScript hasn't yet released the beta - so features might be dropped/added to depending on how the dev work progresses. But based on what they've told us, this is our best guess at the new features coming.

## `using`

Since Explicit Resource Management reached [Stage 3 in TC39](https://github.com/tc39/proposal-explicit-resource-management/tree/22f80f76fe9ed4bd08faff076520fb08b0bf87f9#using-declarations), TypeScript is adding support for the `using` keyword.

It lets you handle resources that require cleanup in a much more declarative way. For instance, a database connection:

```typescript
const getUsers = async () => {
  await using db = await getConnection();

  const users = await db.connection.query('SELECT * FROM users');

  return users;
}

// db is automatically cleaned up when it leaves scope!
```

To learn more, check out [my article previewing `using`](https://www.totaltypescript.com/typescript-5-2-new-keyword-using).

## Fixed Array Methods

In TypeScript 5.1, this code throws a quite horrendous error - shortened for clarity below.

```ts twoslash
// @errors: 2349 7006
interface Fizz {
  id: number;
  fizz: string;
}

interface Buzz {
  id: number;
  buzz: string;
}

function fn(arr: Fizz[] | Buzz[]) {
  // This expression is not callable.
  // Each member of the union type has signatures,
  // but none of those signatures are compatible with each other.
  return arr.filter((item) => item.id > 5);
}
```

This seems strange, since we know that `item.id` is present on both arrays - and both of them arrays, with the same `.filter` method.

But in TypeScript 5.2, this long-standing error is fixed.

### Can't you just change the type?

You might be thinking - you can just change the type to make the error go away:

```ts twoslash
interface Fizz {
  id: number;
  fizz: string;
}

interface Buzz {
  id: number;
  buzz: string;
}
/// ---cut---

function fn(arr: (Fizz | Buzz)[]) {
  return arr.filter((item) => item.id > 5);
}
```

This has been the traditional fix for this error - but it's not always possible. For instance, if you're using a third-party library, you can't change the type of the array.

## Type Argument Placeholders

One of the most discussed features of TypeScript 5.2 is type argument placeholders.

This is a new syntax that lets you pass 'type placeholders' to a type to force TypeScript to infer the type in that slot.

Currently, if you pass in a _single_ type argument to a function, TypeScript will NOT infer the rest of the arguments.

Let's take this function:

```ts twoslash
const makeSelectors = <
  TSource,
  TSelectors extends Record<
    string,
    (source: TSource) => any
  >
>(
  selectors: TSelectors
) => {
  return selectors;
};
```

This takes two type arguments - `TSource` and `TSelectors`. `TSource` is the thing we're selecting from, and `TSelectors` is an object of functions that take a `TSource` and return something.

If we pass in a single type argument, TypeScript will yell at us for not passing in the second type argument:

```ts twoslash
// @errors: 2558 2339
const makeSelectors = <
  TSource,
  TSelectors extends Record<
    string,
    (source: TSource) => any
  >
>(
  selectors: TSelectors
) => {
  return selectors;
};

// ---cut---
const selectors = makeSelectors<{ id: number }>({
  id: (source) => source.id,
});
```

But if we _do_ pass in a second type argument, we end up a LOT of duplicated code:

```ts twoslash
const makeSelectors = <
  TSource,
  TSelectors extends Record<
    string,
    (source: TSource) => any
  >
>(
  selectors: TSelectors
) => {
  return selectors;
};

// ---cut---

const selectors = makeSelectors<
  { id: number },
  // We have to type TSelectors manually!
  {
    id: (source: { id: number }) => number;
  }
>({
  id: (source) => source.id,
});
```

### Why does TypeScript NOT infer the second type argument?

This behaviour was actually never intended from the TypeScript team. To quote [Ryan Cavanaugh](https://github.com/microsoft/TypeScript/issues/54228#issuecomment-1550357449), TypeScript's lead dev:

> The entire reason we're in a difficult spot here in the first place is that generic defaults were sort of rushed in, when we should have really done partial inference for unspecified type parameters instead.

So this behaviour was never really intended - it was just a side-effect of how generics were implemented at the time.

### Type Argument Placeholders

The solution coming in TypeScript 5.2 is "type argument placeholders". Type argument placeholders let you pass in an underscore in the second type argument, and TypeScript will infer the type for you:

```ts
const selectors = makeSelectors<
  { id: number },
  _ // TypeScript infers the type!
>({
  id: (source) => source.id,
});

const result = selectors.id({ id: 1 }); // number
```

This is a big improvement over needing to manually specify the type.

But this approach is still quite controversial. OSS Maintainers from Redux, React Query, XState and ArkType have [all expressed a similar concern](https://github.com/microsoft/TypeScript/pull/26349) - that it puts the onus on the _consumer_ of the function to pass in a placeholder. From [Mateusz Burzyński](https://github.com/microsoft/TypeScript/pull/26349#issuecomment-1536712313), maintainer of XState:

> I have some type parameters that are never meant to be provided manually. [...] I can require our users to use `_` (well, we'll have to) but it feels like a chore as that should be provided manually at all call sites.

It appears that TypeScript's current plan is to ship type argument placeholders, then experiment with automatic inference later down the line. From [Wes Wigham](https://github.com/microsoft/TypeScript/pull/26349#issuecomment-1536644350), the author of the PR:

> I think we'd want to ship without that for a bit, and see if the papercut of writing new `F<A,_,_>()` instead of `F<A>()` is actually a big enough difference to warrant it.

So, for now, type argument placeholders are the best solution we have for this problem.
