---
title: Constraining a Type Helper to Accept Specific Values 
description: Generic type parameters can be constrained to accept only specific values, improving the reliability and predictability of your type helpers.
---

Here we have the `AllOrNothing` and `ToUndefinedObject` type helpers from the previous exercise:

```typescript
type AllOrNothing<T> = T | ToUndefinedObject<T>;

type ToUndefinedObject<T> = Partial<Record<keyof T, undefined>>;
```

However, there's a slight hiccup.

Currently, the type helpers are a bit too flexible. It's not limited to just objects. It can also receive strings, numbers, undefined, null... any possible value.

This is not exactly what we want.

The type helpers should be modified to restrict the input to objects only, and add a warning mechanism for when unsuitable data types are passed in.

## Challenge

Your task is to find a constraint that we can add to `T` to ensure it only accepts specific types of values.

More specifically, we want the value to be an object to be the type that matches what we see in the test:

```typescript
Expect<Equal<AllOrNothing<{ a: string }>, { a: string } | { a?: undefined }>>
```

The main aim is to exclude `strings`, `numbers`, or `undefined` from the list of acceptable types. 

There's not a perfect solution, but we'll look at a couple possible ways to tackle this problem.

Hint: The key phrase you should be looking for is "generic constraints".

Resources:
- [Total TypeScript Generics Workshop](https://www.totaltypescript.com/workshops/typescript-generics)
- [Generics from the TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html)
