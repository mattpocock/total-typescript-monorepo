---
title: Refactoring into a Type Helper
description: Refactor complex logic from a previous exercise into a type helper.
---

Type Helpers are a vital concept to understand when we get to more advanced topics later on, so let's work on another example.

In a previous exercise we looked at an "all or nothing" idea where we had `InputProps` that had two different branches. One branch had `value` and `onChange` and the other branch had then as optional properties:

```typescript
export type InputProps = (
  | {
    value: string;
    onChange: ChangeEventHandler;
  }
  | {
    value?: undefined;
    onChange?: undefined;
  }
) & {
  label: string;
};
```

The current logic can be a bit difficult to read, as we have to manually specify all of this and wrap it in parentheses.


## Challenge

Your challenge is to find a neater way to express this logic and encapsulate it in a reusable type. 

Refactor `InputProps` to use one (or more!) type helpers to achieve the same result. The type helper(s) you create should take in a type `T` and return something that looks similar to the branches seen in the `InputProps` type above.

Resources:
- [Type Helpers on totaltypescript.com](https://www.totaltypescript.com/concepts/type-helpers)
- [Type Helpers from the Type Transformations Workshop](https://www.totaltypescript.com/workshops/type-transformations/type-helpers/introducing-type-helpers)
- [Utility Types from the TypeScript Docs](https://www.typescriptlang.org/docs/handbook/utility-types.html)