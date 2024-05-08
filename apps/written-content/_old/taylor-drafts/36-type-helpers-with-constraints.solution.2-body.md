---
title: Add Generic Constraints to Type Helpers
description: Enforcing constraints helps you prevent errors from occurring, and ensures your type helpers are being used in the correct way.
---

We'll start by taking a closer look at the concept of generic constraints in TypeScript. 

Imagine we have a runtime function `toUndefinedObject`, which accepts a type parameter `T` and returns an empty object:

```typescript
const toUndefinedObject = (t) => {
  return {};
}
```

If we want to constrain this runtime function to only accept an object, we can specify the type of `t` as `object`. Then when we call it with something that is not an object, TypeScript will throw an error:

```typescript
const toUndefinedObject = (t: object) => {
  return {};
}

toUndefinedObject(123123) // Error!
```

This works for the runtime version, but now we want to apply the same constraint to our `ToUndefinedObject` type helper.

## Using `extends` to Constrain Generic Type Parameters

In order to apply a similar constraint to `T` in our `ToUndefinedObject` type helper, we can use the `extends` keyword. 

Adding `extends object` will constrain `T` to the `object` type. This behaves in the same way as the constraint we mentioned earlier. 

```typescript
type ToUndefinedObject<T extends object> = Partial<Record<keyof T, undefined>>;
```

Now if we try to pass a string to `ToUndefinedObject`, TypeScript will throw an error because a string does not satisfy the `object` constraint.

```typescript
type Example = ToUndefinedObject<string> // Error: 'string' does not satisfy the constraint 'object'.
```

However, we are now getting a new error in the `AllOrNothing` type helper on the `ToUndefinedObject` branch because type `T` does not satisfy the constraint `object`.

```typescript
type AllOrNothing<T> = T | ToUndefinedObject<T>; // Error: Type 'T' does not satisfy the constraint 'object'.
```

We get this error because when there is not a constraint, the type defaults to `unknown`. 

To fix this, we need to constrain the `AllOrNothing` in the same way. 

```typescript
type AllOrNothing<T extends object> = T | ToUndefinedObject<T>;
```

With this constraint in place, TypeScript is now able to correctly handle our `AllOrNothing` type and will throw appropriate errors if the wrong type is passed in. 

## A Catch & Alternative Solution

There's a catch to this solution, though– the `object` type constraint is not perfect.

For example, it allows arrays of any type to be passed in, such as string or number arrays. This is due to TypeScript treating everything apart from primitives as an `object`.

```typescript
AllOrNothing<string[]> // No error!
```

An alternative solution that offers a bit more description is using `extends Record<string, any>`. 

This behaves the same as the `object` type but gives a clearer picture of what's happening. 

```typescript
type AllOrNothing<T extends Record<string, any>> = T | ToUndefinedObject<T>;

type ToUndefinedObject<T extends Record<string, any>> = Partial<Record<keyof T, undefined>>;
```

This solution demonstrates cascading constraints throughout the application and our types. You'll find this pattern of using generic constraints in many open source libraries. 

Enforcing constraints helps you prevent errors from occurring, and ensures your type helpers are being used in the correct way.