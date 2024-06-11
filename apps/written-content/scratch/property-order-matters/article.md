Sometimes, the way you order your object properties matters.

## The Setup

Let's imagine we create a function that takes in an object as its argument. In this object, there are two properties: `produce` and `consume`.

```ts twoslash
const process = <T>(obj: {
  produce: (input: string) => T;
  consume: (t: T) => void;
}) => {
  const value = obj.produce("abc");
  obj.consume(value);
};

// ---cut---

process({
  produce: (input) => Number(input),
  consume: (output) => console.log(output),
  //                               ^?
});
```

`produce` takes in an input of `string` and returns some type. `consume` then takes in that value and does something with it. Because of a clever type definition, TypeScript can infer the type of the value returned by `produce` and pass it to `consume`:

```ts twoslash
const process = <T>(obj: {
  produce: (input: string) => T;
  consume: (t: T) => void;
}) => {
  const value = obj.produce("abc");
  obj.consume(value);
};
```

We can use this setup with any type of value, and it'll just work:

```ts twoslash
const process = <T>(obj: {
  produce: (input: string) => T;
  consume: (t: T) => void;
}) => {
  const value = obj.produce("abc");
  obj.consume(value);
};

// ---cut---
process({
  produce: (input) => input + "hello",
  consume: (output) => console.log(output),
  //                               ^?
});

process({
  produce: (input) => ({ value: input }),
  consume: (output) => console.log(output),
  //                               ^?
});
```

## The Problem

This all looks great, until one of our users complains to us. They're trying to use our function, but it's not working:

```ts twoslash
const process = <T>(obj: {
  produce: (input: string) => T;
  consume: (t: T) => void;
}) => {
  const value = obj.produce("abc");
  obj.consume(value);
};

// ---cut---

process({
  consume: (output) => console.log(output),
  //                               ^?
  produce: (input) => Number(input),
});
```

The `output` is being seen by TypeScript as `unknown`. This feels very odd, as the `produce` function is clearly returning a `number`. What's going on?

The difference here is that the user specified `consume` _before_ `produce`. Since TypeScript 4.7, in [this PR](https://github.com/microsoft/TypeScript/pull/48538), TypeScript now uses the order of properties to inform its inference. This was added to fix various long-standing bugs (linked in the PR) with context-sensitive functions.

This means that, in some very narrow cases, the order you specify your properties matters. So if you're running up against strange errors to do with property ordering, that's why!
