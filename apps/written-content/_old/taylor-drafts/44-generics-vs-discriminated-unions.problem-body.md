---
title: Generics Aren't Always the Answer
description: Generics aren't always the best solution for every problem. Sometimes, a different approach is better suited for the task at hand.
---

Let's explore an interesting scenario where generics might not be as beneficial as another approach.

Here we have a `ModalProps` type that takes in a type argument of `TVariant` that extends `PossibleVariants`. This means when using `ModalProps`, we can only pass in `'with-button'` or `'without-button'`. Inside of `ModalProps` is what is essentially a conditional type that will be different based on the variant passed in:

```typescript
export type ModalProps<TVariant extends PossibleVariants> = {
  isOpen: boolean;
  variant: TVariant;
} & (TVariant extends "with-button"
  ? {
    buttonLabel: string;
      onButtonClick: () => void;
    }
  : {});

export type PossibleVariants = "with-button" | "without-button";
```

There's also a `Modal` component that takes in `ModalProps` that requires a variant from `PossibleVariants` in order to work properly:

```typescript
export const Modal = <TVariant extends PossibleVariants>(
  props: ModalProps<TVariant>,
) => {
  // ...
  return null;
};
```

## Challenge

While this is a clever use of generics, it's not the most straightforward approach.

Your challenge is to refactor this code to make it more simple.

It may seem daunting due to the complex syntax, but the solution lies in navigating around it and replacing it with simpler, more familiar constructs and will look similar to something we've seen before.