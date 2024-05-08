```ts twoslash
import { ComponentProps } from "react";

type As<TAs extends keyof JSX.IntrinsicElements> =
  TAs extends any
    ? { as: TAs } & ComponentProps<TAs>
    : never;

type ButtonProps = As<"a" | "button" | "span" | "div">;
```
