# You Can Stop Hating `React.FC`

## Quick Breakdown

As of TypeScript 5.1 and React 18, `React.FC` is now officially 'fine'.

- It no longer implicitly includes `children` in the props type.
- It no longer breaks if you return `undefined`, `string`, or `number`.

I still recommend simply annotating props instead of using `React.FC`. But if you do use `React.FC` in your codebase, there's no reason to remove it.

## Explanation

`React.FC` is a type that ships with React's TypeScript types. It represents the type of a functional component, which is the building block of most modern React apps.

```tsx twoslash
// Component without props
const Component: React.FC = () => {
  return <div />;
};

// Component WITH props:
const Button: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <button>{children}</button>;
};

// Gives you defaultProps...
Button.defaultProps;
//     ^?

// ...and displayName!
Button.displayName;
//     ^?
```

It has a controversial history. It used to be the recommended way to type components. Then, it was considered an anti-pattern.

But now, `React.FC` has changed. Since TypeScript 5.1 and React 18, it's now a **perfectly fine way to type your components**.

### `children` is no longer included in the props type

The main criticism of `React.FC` came from its earlier iteration, which included `children` in the props type. This meant that if you wanted to type a component that didn't accept children, you couldn't use `React.FC`.

```tsx
// This component doesn't accept children
const Component: React.FC = () => {
  return <div />;
};

// No error!
<Component>123</Component>;
```

This criticism was enough to get `React.FC` [removed from `create-react-app`](https://github.com/facebook/create-react-app/pull/8177), the most popular way to bootstrap a React app at the time.

But since TypeScript 5.1, you'd get this error from exactly the same code:

> Type '{ children: string; }' has no properties in common with type 'IntrinsicAttributes'.

```tsx twoslash
// @errors: 2559
// This component doesn't accept children
const Component: React.FC = () => {
  return <div />;
};

// ---cut---

// No error!
<Component>123</Component>;
```

### You can now return `undefined`, `string`, or `number` from `React.FC`

Previous iterations of `React.FC` returned [`React.ReactElement`](/jsx-element-vs-react-reactnode). This meant that perfectly valid components would fall prey to strange errors:

> Type 'X' is not assignable to type 'ReactElement<any, string | JSXElementConstructor<any>>'.

```tsx twoslash
// @errors: 2322
const Component = (): React.ReactElement => {
  return 123;
};
```

This is perfectly valid JavaScript, but TypeScript would complain because `123` isn't assignable to `React.ReactElement`.

But since TypeScript 5.1 and the latest version of React's types, `React.FC` now returns `React.ReactNode`. This more permissive type - meaning the types now match up perfectly with the runtime values:

```tsx twoslash
// No error!
const Component: React.FC = () => {
  return 123;
};
```

This cleans up a nasty error that would pop up in many React apps, and makes `React.FC` more appealing.

### Should you use it?

I used to recommend _never_ using `React.FC` because of the problems listed above. Now, I'd feel fine about seeing it in a codebase. I don't think you should be actively migrating away from it.

But - I still **don't think it's the best way to annotate your types**. That accolade goes to annotating props directly:

```tsx twoslash
const Component = (props: { name: string }) => {
  return <div>{props.name}</div>;
};
```

This approach is nicer because it's friendlier to beginners - you don't need to know what `React.FC` is, or even what type argument syntax is. It's also slightly easier to refactor to a generic component if needed.

But, to be clear, the gap between these two approaches has never been tighter. And I think, based on that, you can stop hating `React.FC`.
