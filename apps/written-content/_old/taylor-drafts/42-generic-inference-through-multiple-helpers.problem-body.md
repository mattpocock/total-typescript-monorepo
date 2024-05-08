---
title: Generic Inference through Multiple Type Helpers
description: Generics enable the useful pattern of inferring type arguments through multiple different type helpers.
---


# ButtonGroup Component and Props

Here we have a component named `ButtonGroup` that takes in a set of props, referred to as `ButtonGroupProps`. 

These props include an array of `buttons`, each of which follows a specific interface structure with a `value` and `label` strings as well as an `onClick` handler:


```typescript
interface Button {
  value: string;
  label: string;
}

interface ButtonGroupProps {
  buttons: Button[];
  onClick: (value: string) => void;
}

const ButtonGroup = (props: ButtonGroupProps) => {
  return (
    <div>
      {props.buttons.map((button) => {
        return (
          <button
            key={button.value}
            onClick={() => {
              props.onClick(button.value);
            }}
          >
            {button.label}
          </button>
        );
      })}
    </div>
  );
};
```

The `buttons` are being mapped and created with their `button.value` being the value that gets sent up when a button is clicked. The `label` is used as the display text on the button.

Inside the `ButtonGroup` test, we want the `value` to be inferred as `"add" | "delete"` instead of just being a string.

The reason for this is that `string` isn't as descriptive as it could be.

We know the exact values that are being passed in here, and ideally, we should be able to just grab those and use them as the value. 

## Challenge

Your challenge is to make the `ButtonGroup` component generic, and ensure the `value` is inferred correctly.