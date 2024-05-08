```tsx twoslash
// @errors: 2322
const buttonProps = {
  type: "button",
};

buttonProps.type = "foo";

<button {...buttonProps}>Click me!</button>;
```

```tsx twoslash
const buttonProps = {
  type: "button",
} as const;

<>
  <button {...buttonProps}>Click me!</button>
</>;
```
