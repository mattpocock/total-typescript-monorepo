`as never` is very occasionally needed in TypeScript. Let's look at an example where it's necessary.

Let's imagine we want to format some input based on its `typeof`. We first create a `formatters` object that maps `typeof` to a formatting function:

```ts twoslash
const formatters = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};
```

Next, we create a `format` function that takes an input of `string | number | boolean` and formats it based on its `typeof`.

```ts twoslash
// @errors: 2345
const formatters = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};

// ---cut---

const format = (input: string | number | boolean) => {
  // We need to cast here because TypeScript isn't quite smart
  // enough to know that `typeof input` can only be
  // 'string' | 'number' | 'boolean'
  const inputType = typeof input as
    | "string"
    | "number"
    | "boolean";
  const formatter = formatters[inputType];

  return formatter(input);
};
```

But there's a strange error:

> Type 'string' is not assignable to type 'never'.

What's going on here?

## Unions Of Functions With Incompatible Params

Let's take a deeper look at the type of `formatter` inside our `format` function:

```ts twoslash
// @noErrors
const formatters = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};

// ---cut---

const format = (input: string | number | boolean) => {
  const inputType = typeof input as
    | "string"
    | "number"
    | "boolean";
  const formatter = formatters[inputType];
  //    ^?

  return formatter(input);
};
```

As you can see, it resolves to a union of functions, each with a different parameter. One function takes a `string`, another a `number`, and the last a `boolean`.

How could we possibly call this function with a `string` and a `number` at the same time? We can't.
So, the function actually resolves to:

```ts twoslash
type Func = (input: never) => string;
```

## Shouldn't The Parameters Resolve To A Union?

You might be thinking, "Shouldn't the parameters resolve to a union of `string | number | boolean`?"

This doesn't work, because calling `formatters.string` with a `number` is unsafe. Calling `formatters.boolean` with a `number` is unsafe.

So, `never` is the only type that makes sense.

## How Do We Fix This?

We happen to know that the logic of this function is sound. We know that `formatters[inputType]` will resolve to the correct type.

So, we can use an `as never`:

```ts twoslash
const formatters = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};

// ---cut---

const format = (input: string | number | boolean) => {
  const inputType = typeof input as
    | "string"
    | "number"
    | "boolean";
  const formatter = formatters[inputType];

  return formatter(input as never);
};
```

This forces TypeScript to consider `input` as the type of `never` - which is, of course, assignable to `formatter`'s parameter of `never`.

## Wouldn't `as any` Work?

Amazingly, `any` doesn't work here:

```ts twoslash
// @errors: 2345
const formatters = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};

// ---cut---

const format = (input: string | number | boolean) => {
  const inputType = typeof input as
    | "string"
    | "number"
    | "boolean";
  const formatter = formatters[inputType];

  return formatter(input as any);
};
```

It results in a horrendous error:

> Argument of type 'any' is not assignable to parameter of type 'never'.

So, `as never` is the only way to go here.
