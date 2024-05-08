---
title: Adding Generic Type Arguments to Type Helpers
description: In order to get proper inference, the type arguments need to be passed appropriately to the type helpers.
---


Alright, let's dive into button group props. As we look into this, we can probably infer that `value` is going to need to be a generic type. So, for the time being, let's denote it as `T value`.

As we've seen before, we can tell that `value` is going to need to be a generic type. We'll denote it as `TValue` for now.

Let's start by putting it on `ButtonGroupProps`:

```typescript
interface ButtonGroupProps<TValue> {
  buttons: Button[];
  onClick: (value: TValue) => void;
}
```

Then we will instantiate and add it to the `ButtonGroup`:

```typescript
const ButtonGroup = <TValue,>(props: ButtonGroupProps<TValue>) => {
  ...
```

With this change, we now have a different error at `props.onClick(button.value)`.

```typescript
// inside ButtonGroup

onclick={() => {
  props.onClick(button.value); // Error!
}}
```

The error tells us:

```
Argument of type 'string' is not assignable to parameter of type 'TValue', and that 'TValue' could be instantiated with an arbitrary type which could be unrelated to 'string'.
```

We're getting this error because inside of `ButtonGroupProps`, `value` is currently being inferred as `unknown`. This is because at this point, `onClick` doesn't know what `value` is supposed to be. TypeScript doesn't attempt any inference there. 

## Fixing the `value` Inference

One approach to fix this error would be to specify `value` to be `'add' | 'delete'` inside of the `ButtonGroup` component's `onClick` prop:

```typescript
<ButtonGroup
  onClick={(value: 'add' | 'delete') => {
    ...
```

Now the test passes, but it isn't very DRY and it isn't constrained properly either.

The real solution is to infer the `value` inside of the `Button` interface. We can do this by adding the `TValue` type argument to the `Button` interface, and update `value` to use it:

```typescript
interface Button<TValue> {
  value: TValue;
  label: string;
}
```

With this change, we now need to update the `ButtonGroupProps` to pass the `TValue` as a type argument to the `buttons` array:

```typescript
interface ButtonGroupProps<TValue> {
  buttons: Button<TValue>[];
  onClick: (value: TValue) => void;
}
```

## Updating the `key` Prop

We have inference working, but now we have a new error in the `key` prop when the buttons are rendered:

```typescript
// inside the `props.buttons.map` function
return(
  <button
    key={button.value} // Error!
  ...
```

The error here is that `TValue` is not assignable to type `Key | null | undefined`.

We get this error because React's `Key` expects to be a `string` or a `number` which we can find in the React types.

In order to transform `TValue` into a string, we need to update the `ButtonGroup`'s type argument to extend `string`:

```typescript
const ButtonGroup = <TValue extends string,>(
  props: ButtonGroupProps<TValue>
) => {
  ...
```

Now our errors are all clear!

## Recap

This pattern of inferring type arguments from multiple different helpers is super useful.

We have a generic type `TValue` that is being passed into `ButtonGroupProps`. Then it is passed down into `Button` where it finally finds a place where it can infer from. We also have the constraint to ensure that the `value` prop is what we expect.

Even though the type is passed down through a couple of different layers, TypeScript still manages to get the inference working.
