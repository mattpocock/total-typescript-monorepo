React's internal types can be a bit of a struggle to use. Many of them are undocumented, hard to read, and harder to use.

This article will help you understand the most useful React types, and how to use them.

## Component Props

There are several type helpers that help when working with props in React.

### ComponentProps

I've written extensively about the [ComponentProps type](https://www.totaltypescript.com/react-component-props-type-helper) before.

The ComponentProps type helper lets you extract the props from a component.

```tsx twoslash
import { ComponentProps } from "react";

const MyComponent = (props: { label: string }) => {
  return <div>{props.label}</div>;
};

type WrapperProps = ComponentProps<typeof MyComponent>;
```

This can be extremely useful when you don't control the component definition, but need to use its props.

`ComponentProps` can also be used on built-in components to extract their props:

```tsx twoslash
import { ComponentProps } from "react";

type DivProps = ComponentProps<"div">;
```

Bear in mind that using `ComponentProps` to define custom components can slow down your TypeScript performance if not used correctly, as I wrote in my [React Props](https://www.totaltypescript.com/react-props-typescript) article.

#### ComponentPropsWithRef/ComponentPropsWithoutRef

These two helpers let you extract out the props from a component, but with/without the `ref` prop.

```tsx twoslash
// @errors: 2339
import {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
} from "react";

type PropsWithRef = ComponentPropsWithRef<"div">;

type Ref = PropsWithRef["ref"];
//   ^?

type PropsWithoutRef = ComponentPropsWithoutRef<"div">;

type Ref2 = PropsWithoutRef["ref"];
```

This can be useful when you want to control whether the component props you extract have a `ref` or not.

Just like `ComponentProps`, these can be used on custom components too. Though, `ComponentPropsWithRef` will not _add_ a `ref` if one is not present.

```tsx twoslash
// @errors: 2339
import { ComponentPropsWithRef } from "react";

const MyComponent = (props: { label: string }) => {
  return <div>{props.label}</div>;
};

type PropsWithRef = ComponentPropsWithRef<
  typeof MyComponent
>;

type Ref = PropsWithRef["ref"];
```

### PropsWithChildren

## Components

### FC and FunctionComponent

### ComponentType

### ElementType

## JSX

### ReactNode

### JSX.Element and React.ReactElement

### JSX.IntrinsicElements

## Refs

### ElementRef

### ForwardedRef

## Hooks

### SetStateAction

### Reducer

### Dispatch

### DispatchWithoutAction

### EffectCallback

### DependencyList

```

```
