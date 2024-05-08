# How to Pass a Component as a Prop in React

React's props model is extremely powerful. One of its most useful features is the ability to pass a component _as a prop_. This lets you create composable pieces of UI, helping to make your components more reusable.

The trouble is that this can often be difficult to type correctly. Let's fix that.

## Passing JSX as a Prop

One of the most flexible ways to pass a component as a prop is to get the component to receive JSX. Let's look at the example below:

```tsx twoslash
interface LayoutProps {
  nav: React.ReactNode;
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  return (
    <>
      <nav>{props.nav}</nav>
      <main>{props.children}</main>
    </>
  );
};

<Layout nav={<h1>My Site</h1>}>
  <div>Hello!</div>
</Layout>;
```

Here, we're passing `<h1>My Site</h1>` to the `nav` prop, and `<div>Hello!</div>` to the `children` prop.

We're typing our props as `React.ReactNode`, which is a type that accepts any valid JSX. Note that we're not using `React.ReactElement` or `JSX.Element`. I cover why in [this article](https://www.totaltypescript.com/jsx-element-vs-react-reactnode).

## Passing a Component as a Prop

The second method is, instead of passing in JSX as a prop, we pass in an entire _component_ as a prop.

Some definitions here. JSX is the thing a component returns. `<Wrapper />` is JSX. `Wrapper` is the `component`.

The simplest way to type this in TypeScript is by using `React.ComponentType`:

```tsx twoslash
declare const UserIcon: React.ComponentType<{
  className?: string;
}>;

// ---cut---

const Row = (props: {
  icon: React.ComponentType<{
    className?: string;
  }>;
}) => {
  return (
    <div>
      <props.icon className="h-8 w-8" />
    </div>
  );
};

<Row icon={UserIcon} />;
```

Here, we're typing the `icon` prop as `React.ComponentType`. We're passing `{ className?: string }` to `React.ComponentType`, indicating that this is a component that can receive a `className` prop.

This basically says `icon` can be any component that can receive a `className` prop. This is a very flexible type, and it's easy to use.

## Passing a Native Tag as a Prop

Using `React.ElementType` lets you pass a native tag as a prop OR a custom component.

```tsx twoslash
declare const UserIcon: React.ComponentType<{
  className?: string;
}>;

// ---cut---
const Row = (props: {
  element: React.ElementType<{
    className?: string;
  }>;
}) => {
  return (
    <div>
      <props.element className="h-8 w-8" />
    </div>
  );
};

<Row element={"div"} />;
<Row element={UserIcon} />;
```

This is an extremely flexible definition and, again, very easy to use. We'll even get autocomplete on all the options we can pass to `element`.

For more information about `React.ComponentType` and `React.ElementType`, check out [this exercise](https://www.totaltypescript.com/workshops/advanced-react-with-typescript/types-deep-dive/understanding-react-s-elementtype-and-componenttype) in my Advanced React course.

## Passing Any Component as a Prop and Inferring Its Props

The final method is to be able to receive _any_ component and infer its props. This is very flexible but also extremely complex to type.

In my Advanced React and TypeScript course, I devote half of an entire section to [this topic](https://www.totaltypescript.com/workshops/advanced-react-with-typescript/advanced-patterns/the-as-prop-in-react).

The final solution I landed on is documented [here](https://github.com/total-typescript/react-typescript-tutorial/blob/main/src/08-advanced-patterns/72-as-prop-with-forward-ref.solution.tsx).

```tsx twoslash
// @errors: 2322
import {
  ComponentPropsWithRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  useRef,
} from "react";

type FixedForwardRef = <T, P = {}>(
  render: (
    props: P,
    ref: React.Ref<T>
  ) => React.ReactNode
) => (
  props: P & React.RefAttributes<T>
) => React.ReactNode;

const fixedForwardRef =
  forwardRef as FixedForwardRef;

type DistributiveOmit<
  T,
  TOmitted extends PropertyKey
> = T extends any ? Omit<T, TOmitted> : never;

export const UnwrappedAnyComponent = <
  TAs extends ElementType
>(
  props: {
    as?: TAs;
  } & DistributiveOmit<
    ComponentPropsWithRef<
      ElementType extends TAs ? "a" : TAs
    >,
    "as"
  >,
  ref: ForwardedRef<any>
) => {
  const { as: Comp = "a", ...rest } = props;
  return <Comp {...rest} ref={ref}></Comp>;
};

// Can be passed 'as' prop but defaults to 'a'
const AnyComponent = fixedForwardRef(
  UnwrappedAnyComponent
);

// Defaulted to 'a'
<AnyComponent href="/" />;

// It's now a div, so can't be an href!
<AnyComponent as="div" href="/" />;
```

## Which Should I Choose?

If you're in a situation where you can choose either of the above approaches, I would lean towards passing JSX as a prop.

It's not only easy to type (`React.ReactNode`) but also very performance-friendly. JSX passed to a component as a prop is _not_ re-rendered when that parent component re-renders. This can be a huge performance boost.

But if you do need the other methods, then `React.ElementType` and `React.ComponentType` are both easy to type and easy to use.

If you can, stay away from using the open-ended 'as' prop. But if you do need it, then the description in [my advanced course](https://www.totaltypescript.com/workshops/advanced-react-with-typescript/advanced-patterns/the-as-prop-in-react) will help.
