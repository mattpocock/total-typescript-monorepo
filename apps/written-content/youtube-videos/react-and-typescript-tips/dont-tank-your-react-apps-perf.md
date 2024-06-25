```tsx !!
// @noErrors
import React from "react";

// ---cut---
// Let's create a Button component, where we're
// treating it as a normal button with some styling.
const Button = (props) => {
  return (
    <button
      {...props}
      className={`bg-gray-400 ${props.className}`}
    />
  );
};
```

```tsx !!
// @errors: 7006
import React from "react";

// ---cut---
// The issue is: how do we type these props?
const Button = (props) => {
  return (
    <button
      {...props}
      className={`bg-gray-400 ${props.className}`}
    />
  );
};
```

```tsx !!
// @errors: 2339
import React from "react";

// ---cut---
type ButtonProps = {
  className?: string;
};

// Let's first add some ButtonProps, and
// define them above.
const Button = (props: ButtonProps) => {
  return (
    <button
      {...props}
      className={`bg-gray-400 ${props.className}`}
    />
  );
};
```

```tsx !!
// @errors: 2322
import React from "react";

// ---cut---
type ButtonProps = {
  className?: string;
};

const Button = (props: ButtonProps) => {
  return (
    <button
      {...props}
      className={`bg-gray-400 ${props.className}`}
    />
  );
};

// But this doesn't scale very well - we'd need
// to add every single prop that a button can have
// to ButtonProps.
<Button onClick={() => {}} />;
```

```tsx !!
// @errors: 2339
import React from "react";

// ---cut---
// Instead, we can use the ComponentProps helper
// to get all the props that a button can have.
type ButtonProps = React.ComponentProps<"button">;

const Button = (props: ButtonProps) => {
  return (
    <button
      {...props}
      className={`bg-gray-400 ${props.className}`}
    />
  );
};
```

```tsx !!
// @errors: 2339
import React from "react";

// ---cut---
// But what if we want to add an extra prop
// that isn't on ButtonProps?

// You might think that this pattern makes most sense:
// using an intersection to combine the button props
// with our custom prop.
type ButtonProps = React.ComponentProps<"button"> & {
  variant: "primary" | "secondary";
};
```

```tsx !!
// @errors: 2339
import React from "react";

declare const Button: React.FC<ButtonProps>;

// ---cut---
type ButtonProps = React.ComponentProps<"button"> & {
  variant: "primary" | "secondary";
};

// It certainly works fine, and seems to do everything
// we need it to.
<Button variant="primary" />;
```

```tsx !!
// @errors: 2339
import React from "react";

declare const Button: React.FC<ButtonProps>;

// ---cut---
// But this pattern can absolutely tank your React
// app's TypeScript performance.

// It's a recipe for a slow IDE and a slow CI.
type ButtonProps = React.ComponentProps<"button"> & {
  variant: "primary" | "secondary";
};
```

```tsx !!
// @errors: 2339
import React from "react";

declare const Button: React.FC<ButtonProps>;

// ---cut---
// This is because intersections are much slower for
// TS to check than interface extensions.

// Sentry found a massive speedup in their IDE perf
// when they replaced all their intersections with
// 'interface extends'.
type ButtonProps = React.ComponentProps<"button"> & {
  variant: "primary" | "secondary";
};
```

```tsx !!
// @errors: 2339
import React from "react";

declare const Button: React.FC<ButtonProps>;

// ---cut---
// The fix is pretty simple: just replace the intersection
// with interface extends.

// This should give your IDE a nice speed boost
// in big projects.
interface ButtonProps extends React.ComponentProps<"button"> {
  variant: "primary" | "secondary";
}
```

```tsx !!
// @errors: 2430
import React from "react";

declare const Button: React.FC<ButtonProps>;

// ---cut---
// If you want to override a prop in the base interface,
// by default it won't let you:
interface ButtonProps extends React.ComponentProps<"button"> {
  // onClick already exists on ButtonProps, so we're
  // getting an error when we try to override it with
  // a different type:
  onClick: (id: string) => void;
}
```

```tsx !!
// @errors: 2339
import React from "react";

declare const Button: React.FC<ButtonProps>;

// ---cut---
// But you can remove it from the base interface using
// Omit:
type BaseButtonProps = Omit<
  React.ComponentProps<"button">,
  "onClick"
>;

// Then use the modified type instead.
interface ButtonProps extends BaseButtonProps {
  onClick: (id: string) => void;
}
```
