```tsx twoslash
import { ComponentProps } from "react";

// Great for getting the props of a built-in component...
type ButtonProps = ComponentProps<"button">;

type ButtonPropsType = ButtonProps["type"];
//   ^?
```

```tsx twoslash
// @jsx: react-jsx
import { ComponentProps } from "react";

// ...or, imagining that this component is coming
// from a third-party library...
const MyComp = (props: {
  renderMode: "basic" | "advanced";
}) => {
  // ...implementation
  return <div />;
};

// ...we can still extract its props!
type MyCompProps = ComponentProps<typeof MyComp>;
//   ^?
```
