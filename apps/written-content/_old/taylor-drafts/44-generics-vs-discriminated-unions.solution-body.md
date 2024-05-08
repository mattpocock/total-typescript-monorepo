---
title: Refactoring from Generics to a Discriminated Union
description: Replacing generics with a discriminated union can make your code cleaner and easier to understand while still maintaining the same inference.
---

Looking at `ModalProps`, we're trying to say that there are two different states for it to be in:

If you pass in the `with-button` variant, you must also pass in `buttonLabel` and `onButtonClick`.

If you pass in the `without-button` variant, you don't need to pass those in.

This is a classic use case for a discriminated union.

## Refactoring `ModalProps` to use a Discriminated Union

Let's start by handling just the `with-button` variant in `ModalProps`:

```typescript
export type ModalProps<TVariant extends PossibleVariants> = {
  isOpen: boolean;
} & ({
  variant: "with-button";
  buttonLabel: string;
  onButtonClick: () => void;
});
```

Now let's add the `without-button` variant. We can also delete the `TVariant` slot because we don't need it anymore.

```typescript
export type ModalProps = {
  isOpen: boolean;
} & ({
  variant: "with-button";
  buttonLabel: string;
  onButtonClick: () => void;
} | {
  variant: "without-button";
});
```

Both variants are handled, and `ModalProps` is no longer generic.

## Removing the `TVariant` Type Argument from `Modal`

Since `ModalProps` is no longer generic, we can remove the `TVariant` type argument from `Modal`:

```typescript
export const Modal = (props: ModalProps) => {
  // ...
  return null;
};
```

Our functionality still works as expected, and we still get autocomplete on the variant props.

And there you have it! We've successfully refactored our modal props to use discriminated unions, making our code cleaner and more maintainable.

This lesson serves as a reminder that generics, despite their usefulness, are not always the answer. Sometimes, we can get cleaner outputs and make our code easier to understand by opting for different approaches.