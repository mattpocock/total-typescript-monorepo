---
title: Declaring Generic Types
description: You can use angle brackets syntax to turn a type into a generic type, turning into a kind of function for other types.
---

# Declaring Generic Types

Once you understand how to [use generic types](./what-is-a-generic-type.md), you'll start wondering "how do I create my own?".

Building your own type helpers can make your type-level code clearer and more reusable, and is a critical part of building library code.

Let's take a look at the syntax.

```typescript
// Type as value
type Value = string;

// Type as function
type TypeFunction<T> = T | string;
```

In the `TypeFunction` example above, we can pass it a new type and it'll add `| string` to the [union](./union-types.md).

```typescript
type Result = TypeFunction<number>;
//   number | string
```

The `T` is used [as a convention](./why-is-t-the-convention.md), we can actually name the type parameter anything we like.

```typescript
type TypeFunction<TWhatever> = TWhatever | string;
```

If we try to reference `TWhatever` without _instantiating_ it, we'll get an error.

```typescript
type TypeFunction = TWhatever | string;
// Cannot find name 'TWhatever'.
```

We can also specify multiple parameters. By convention, these are usually `T` and `U`.

```typescript
type TypeFunction<T, U> = T | U | string;

type Result = TypeFunction<number, boolean>;
//   string | number | boolean
```

TypeScript will yell at us if we don't pass all of the type arguments to the generic type:

```typescript
type Result = TypeFunction<number>;
//   Generic type 'TypeFunction' requires 2 type argument(s).
```

You can also specify [defaults](./defaults-in-generic-types.md) in these parameters, as well as [constraints](./constraints-in-generic-types.md) to ensure that the types passed in match a certain contract.
