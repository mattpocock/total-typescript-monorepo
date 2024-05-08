When you're working in a React app, declaring a type for your React props is likely going to be your most common TypeScript activity.

There's some debate over the best method for typing props. In this article, I'll show you the pros and cons of each method and give you my recommendation.

If you want to learn by doing, check out my free interactive course on [React and TypeScript](/tutorials/react-with-typescript/components/ensure-props-are-present-and-defined).

## The 3 Methods of Typing Props

### Inline Object Literals

Props can be declared using an inline object literal.

```tsx twoslash
import { ReactNode } from "react";

const Wrapper = (props: {
  children?: ReactNode;
}) => {
  return <div>{props.children}</div>;
};
```

Prop types can also be destructured, leading to a strange `{}: {}` syntax.

```tsx twoslash
import { ReactNode } from "react";

const Wrapper = ({
  children,
}: {
  children?: ReactNode;
}) => {
  return <div>{children}</div>;
};
```

### Type Aliases

Prop types can also be extracted to a type alias:

```tsx twoslash
import { ReactNode } from "react";

export type WrapperProps = {
  children?: ReactNode;
};

const Wrapper = (props: WrapperProps) => {
  return <div>{props.children}</div>;
};
```

Type aliases should always be exported along with the component - that way you can use them in other files if needed.

Props declared in a type alias can also be destructured:

```tsx twoslash
import { ReactNode } from "react";

export type WrapperProps = {
  children?: ReactNode;
};

// ---cut---

const Wrapper = ({ children }: WrapperProps) => {
  return <div>{children}</div>;
};
```

### Interfaces

Interfaces are another way to declare props:

```tsx twoslash
import { ReactNode } from "react";

export interface WrapperProps {
  children?: ReactNode;
}

const Wrapper = (props: WrapperProps) => {
  return <div>{props.children}</div>;
};
```

Just like type aliases, interfaces should always be exported so they can be reused later.

And, just like type aliases, interfaces can be destructured.

```tsx twoslash
import { ReactNode } from "react";

export interface WrapperProps {
  children?: ReactNode;
}

// ---cut---

const Wrapper = ({ children }: WrapperProps) => {
  return <div>{children}</div>;
};
```

Now that we've seen all the methods, let's look at all the pros and cons before we make our final decision.

## Use A React Props Code Snippet

The main benefit of inline object literals is speed. You can type your props quickly and move on.

The issue becomes that inline object literals will, eventually, need to be extracted out to a type.

So if you're writing a component, you should probably use a type alias or interface.

To get over this hurdle, I'd advise writing your own code snippets for type aliases and interfaces.

Here's a [code snippet](https://code.visualstudio.com/docs/editor/userdefinedsnippets) that will work in VSCode for creating your own components.

```json
{
  "component": {
    "prefix": "comp",
    "body": [
      "export interface $1Props {",
      "  $2",
      "}",
      "",
      "export const $1 = (props: $1Props) => {",
      "  return $3",
      "}"
    ]
  }
}
```

Autocompleting to `comp` will expand to a component with an interface, both exported.

## Interfaces over Intersections

My opinions on type aliases vs. interfaces are well documented in [this article](https://www.totaltypescript.com/type-vs-interface-which-should-you-use). In short, I prefer the `type` in general because of the 'declaration merging' property of the `interface`, which can confuse and frustrate beginners.

But there's one particular case where interfaces win over type aliases - that's in creating complex intersections of props.

Let's say you're creating a component that has all the props of `input` but needs to add a `label` prop. You'll need to extend from the `ComponentProps` type helper, described in [my article](https://www.totaltypescript.com/react-component-props-type-helper).

It is tempting to use a `type` alias:

```tsx twoslash
import { ComponentProps } from "react";

export type InputProps =
  ComponentProps<"input"> & {
    label: string;
  };

export function Input({
  label,
  ...props
}: InputProps) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
```

But unfortunately, intersections used this way will, on the scale of a large codebase, slow TypeScript down.

Instead, you should use an interface, using `interface extends`:

```tsx twoslash
import { ComponentProps } from "react";

export interface InputProps
  extends ComponentProps<"input"> {
  label: string;
}

// ---cut---
export function Input({
  label,
  ...props
}: InputProps) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
```

This advice comes from [TypeScript's performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance), as well as a [PR from Sentry's codebase](https://github.com/getsentry/sentry/pull/30847/files) that sped up their type checking by removing these intersections in favor of interfaces.

So in situations where you're extending from other types, use interfaces.

## Final Thoughts

In general, you should use `interface` to declare your props. They're the most performant, and with a code snippet, they're fast to write.

If you've already got props declared using `type` or inline object literals, don't worry - this isn't worth a refactor.

But if your codebase starts to feel sluggish in your IDE, check for intersections in your props. If you find any, try to refactor them to `interface extends`.
