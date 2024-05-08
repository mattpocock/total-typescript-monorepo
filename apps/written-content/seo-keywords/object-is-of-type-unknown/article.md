## Quick Explanation

> Object is of type 'unknown'.

This error is probably occurring because you're trying to access a property on something marked as `unknown` before narrowing it. You should either narrow it, or use a type assertion.

This is extremely common in `try`/`catch` blocks:

```ts twoslash
// @errors: 18046
try {
  // some code
} catch (e) {
  console.log(e.message);
}
```

This is happening because `unknown` is considered to be _any_ possible type. It's different from `any` because you can't access any properties on it without narrowing it first. With `any`, you can access any property on it _without_ narrowing it.

## Solution 1: Narrow the type

The first option is to narrow the type. You can do this by checking if the property exists on the object:

```ts twoslash
try {
  // some code
} catch (e) {
  if (
    typeof e === "object" &&
    e &&
    "message" in e &&
    typeof e.message === "string"
  ) {
    // message gets narrowed to string!
    console.log(e.message);
    //            ^?
  }
}
```

We first check if `e` is an `object`. Then, we check if it's not `null` or `undefined`. Then, we check if it has a `message` property. Finally, we check if `e.message` is a `string`.

TypeScript is smart enough to follow along with this logic and narrow `e.message` to a `string`!

## Solution 2: Narrow the type using `instanceof`

If you're dealing with a class, you can use `instanceof` to narrow the type. This works especially well with errors:

```ts twoslash
try {
  // some code
} catch (e) {
  if (e instanceof Error) {
    // e is narrowed to Error!
    console.log(e.message);
    //            ^?
  }
}
```

## Solution 3: Use a type predicate

You can wrap your narrowing logic in a custom type predicate:

```ts twoslash
function hasMessage(x: unknown): x is { message: string } {
  return Boolean(
    typeof x === "object" &&
      x &&
      "message" in x &&
      typeof x.message === "string"
  );
}

try {
  // some code
} catch (e) {
  if (hasMessage(e)) {
    // e is narrowed to { message: string }!
    console.log(e.message);
    //            ^?
  }
}
```

This is useful if you want to reuse the same logic in multiple places.

## Solution 4: Use a type assertion

If you're sure that the type is correct, you can use a type assertion to tell TypeScript that it's correct:

```ts twoslash
try {
  // some code
} catch (e) {
  console.log((e as Error).message);
}
```

This is the least type-safe option, but it's also the easiest to use. Just be careful that you're not asserting the wrong type!
