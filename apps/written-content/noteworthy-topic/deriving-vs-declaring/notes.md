```ts twoslash
// Declare the type first, then enforce the value...

type Padding = "small" | "medium" | "large";

const padding: Record<Padding, number> = {
  small: 8,
  medium: 16,
  large: 24,
};
```

```ts twoslash
// Derive the type from the value
const padding = {
  small: 8,
  medium: 16,
  large: 24,
};

type Padding = keyof typeof padding;
//   ^?
```
