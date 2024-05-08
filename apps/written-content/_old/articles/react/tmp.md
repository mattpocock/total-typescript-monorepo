## Quick Explanation

- `JSX.Element` and `React.ReactElement` are functionally the same type. They can be used interchangeably. They represent the thing that a JSX expression creates.

```tsx twoslash
const node: JSX.Element = <div />;

const node2: React.ReactElement = <div />;
```

- They can't be used to represent _all_ the things that React can render, like strings and numbers. For that, use `React.ReactNode`.

```tsx twoslash
// @errors: 2322

const node: React.ReactNode = <div />;
const node2: React.ReactNode = "hello world";
const node3: React.ReactNode = 123;
const node4: React.ReactNode = undefined;
const node5: React.ReactNode = null;

const node6: JSX.Element = "hello world";
```

- In everyday use, you should use `React.ReactNode`. You rarely need to use the more specific type of `JSX.Element`.
