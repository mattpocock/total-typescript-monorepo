## Quick Explanation

- TypeScript 5.2 introduces type argument placeholders, which let you pass a `_` to a type argument to allow it to infer the type instead of using its default.

```ts
// The underscores tell TypeScript to infer those type arguments!
func<string, _, _>();
```

- This is a fix for 'partial inference' - a long-requested feature that lets you pass in a single type argument to a function and have TypeScript infer the rest.

- The solution is controversial but represents an important incremental step forward.

## Full Explanation

One of the most discussed features of TypeScript 5.2 is type argument placeholders.

This is a new syntax that lets you pass 'type placeholders' - an `_` - as a type argument to force TypeScript to infer the type in that parameter.

### The Problem

Currently, if you pass in a _single_ type argument to a function, TypeScript will NOT infer the rest of the arguments.

Let's take this function:

```ts twoslash
const makeSelectors = <
  TSource,
  TSelectors extends Record<string, (source: TSource) => any>
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
  TSelectors extends Record<string, (source: TSource) => any>
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
  TSelectors extends Record<string, (source: TSource) => any>
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

#### Why does TypeScript NOT infer the second type argument?

This behavior was actually never intended from the TypeScript team. To quote [Ryan Cavanaugh](https://github.com/microsoft/TypeScript/issues/54228#issuecomment-1550357449), TypeScript's lead dev:

> The entire reason we're in a difficult spot here in the first place is that generic defaults were sort of rushed in, when we should have really done partial inference for unspecified type parameters instead.

So this behavior was never really intended - it was just a side-effect of how generics were implemented at the time.

### The Solution: Type Argument Placeholders

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

But this approach is still quite controversial. OSS maintainers from Redux, React Query, XState and ArkType have [all expressed a similar concern](https://github.com/microsoft/TypeScript/pull/26349) - that it puts the onus on the _consumer_ of the function to pass in a placeholder. From [Mateusz Burzyński](https://github.com/microsoft/TypeScript/pull/26349#issuecomment-1536712313), maintainer of XState:

> I have some type parameters that are never meant to be provided manually. [...] I can require our users to use `_` (well, we'll have to) but it feels like a chore as that should be provided manually at all call sites.

It appears that TypeScript's current plan is to ship type argument placeholders, then experiment with automatic inference later down the line. From [Wes Wigham](https://github.com/microsoft/TypeScript/pull/26349#issuecomment-1536644350), the author of the PR:

> I think we'd want to ship without that for a bit, and see if the papercut of writing new `F<A,_,_>()` instead of `F<A>()` is actually a big enough difference to warrant it.

So, for now, type argument placeholders are the best solution we have for this problem. But it's likely that this will be revisited in the future.
