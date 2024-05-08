# `unknown` vs `any`

## Quick Explanation

- `any` is a special type that disables type checking on anything it's applied to.

```ts twoslash
function myFunc(param: any) {
  // No error!
  param.x;
}
```

- `unknown` is a type that represents something that you _don't know what it is_. It'll throw an error if you try to use it.

```ts twoslash
// @errors: 18046
function myFunc(param: unknown) {
  param.x;
}
```

- You can use various types of narrowing to narrow `unknown` to a more specific type.

```ts twoslash
function myFunc(param: unknown) {
  // Narrowing param to a string
  if (typeof param === "string") {
    param.toUpperCase();
    // ^?
  }

  // Narrowing param to an object with an id property
  if (
    typeof param === "object" &&
    param &&
    "id" in param &&
    typeof param.id === "string"
  ) {
    param.id.toUpperCase();
    //    ^?
  }
}
```

- If you're choosing between the two, you should always skew towards `unknown`. It forces you to code defensively, so you're less likely to create bugs.

- `any` can be useful for edge cases where _you know better than TypeScript_ - which are relatively rare.

## Explanation
