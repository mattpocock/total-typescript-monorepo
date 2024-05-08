---
title: What is a Generic Type?
description: A generic type is a pattern where a type can receive other types as arguments.
---

# What is a Generic Type?

A generic type is a pattern where a type can receive other types as arguments. The type becomes a kind of type-level function - receiving in a type (or several types) and returning other types. They're different from [generics in functions or classes](./generics-in-functions-and-classes.md).

These are often referred to as 'type helpers' - types which can help you create other types.

There are many type helpers available natively in TypeScript.

```typescript
/**
 * The Promise helper takes any type, and
 * wraps it in a promise.
 */
type PromisifiedString = Promise<string>;

/**
 * The Awaited helper takes in any type and
 * unwraps it - returning the awaited value
 */
type Result = Awaited<PromisifiedString>;
```

The syntax you use for passing arguments to type helpers is similar to calling functions in JavaScript - except that you use angle brackets, not parentheses.

```typescript
const promisifiedString =
  Promise.resolve("my-string");
```

Some type helpers require multiple arguments, like `Record`:

```typescript
/**
 * Creates an object where all the keys are strings,
 * and all the values are strings.
 */
type MyRecord = Record<string, string>;
```

You can investigate the type of any type helper by performing a '[Go To Definition](./go-to-definition.md)' on it. For instance, `Record` reveals itself as:

```typescript
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

This syntax is how you [declare generic types](./declaring-generic-types.md). You can also add [constraints](./constraints-in-generic-types.md) and [defaults](./defaults-in-generic-types.md) to them.
