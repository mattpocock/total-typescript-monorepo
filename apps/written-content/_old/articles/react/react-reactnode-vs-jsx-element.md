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

## Full Explanation

When the TypeScript team started work on supporting React, JSX was the big stumbling block. Its syntax doesn't exist in JavaScript, so they had to build it into the compiler.

They came up with the idea for `.tsx` files, the `jsx` option in `tsconfig.json`, and suddenly, JSX was supported. But there was an interesting unanswered question: what type should this function infer as?

### `JSX.Element`

```tsx
// When I hover this, what should I get?
const Component = () => {
  return <div>Hello world</div>;
};
```

The answer was a special type called `JSX.Element`. If you hover over a component today, you'll likely see:

```tsx
// const Component: () => JSX.Element
```

`JSX` is something called a global namespace. It's like an object in the global scope. A namespace can contain types, and `Element` is one of those types. This means that if React's type definitions define `JSX.Element`,` it'll be picked up by TypeScript.

Here's how it looks in React's type definitions:

```typescript
// Puts it in the global scope
declare global {
  // Puts it in the JSX namespace
  namespace JSX {
    // Defines the Element interface
    interface Element
      extends React.ReactElement<any, any> {}
  }
}
```

We can think of `JSX.Element`, however it's defined, as representing the thing that calling a JSX expression returns. It's the type of the thing that gets created when you write JSX.

#### What is `JSX.Element` used for?

Now - why would this knowledge be useful to you? What would you want to use the `JSX.Element` type for?

The most obvious choice would be for typing the `children` property of a component.

```tsx
const Component = ({
  children,
}: {
  children: JSX.Element;
}) => {
  return <div>{children}</div>;
};
```

The issues start to become apparent when you begin using this type. For example, what happens if you want to render a string?

```tsx
// 'Component' components don't accept text as
// child elements. Text in JSX has the type
// 'string', but the expected type of 'children'
// is 'Element'.
<Component>hello world</Component>
```

This is perfectly valid - React can handle various things as children of components, like numbers, strings, and even `undefined`.

But TypeScript isn't happy. We've made the type of `children` `JSX.Element`, which only accepts JSX.

We need a different type definition to use for `children`. We need a type that accepts strings, numbers, undefined, and JSX.

### `React.ReactNode`

This is where `React.ReactNode` comes in. It's a type that accepts everything that React can render.

It lives in the React namespace:

```typescript
declare namespace React {
  type ReactNode =
    | ReactElement
    | string
    | number
    | ReactFragment
    | ReactPortal
    | boolean
    | null
    | undefined;
}
```

We can use it to type our `children` prop:

```tsx
const Component = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div>{children}</div>;
};
```

Now we can pass in strings, numbers, undefined, and JSX:

```tsx
<Component>hello world</Component>
<Component>{123}</Component>
<Component>{undefined}</Component>
<Component>
  <div>Hello world</div>
</Component>
```

#### When *shouldn't* we use `React.ReactNode`?

In TypeScript versions before 5.1, you can't use `React.ReactNode` in one specific case - typing the return type of a component.

```tsx
const Component = (): React.ReactNode => {
  return <div>Hello world</div>;
};
```

It looks okay when defining it, but when we go to use it, it'll freak out:

> 'Component' cannot be used as a JSX component. Its return type 'ReactNode' is not a valid JSX element.

```tsx
// 'Component' cannot be used as a JSX component.
//   Its return type 'ReactNode' is not a valid JSX element.
<Component />
```

> 'Component' cannot be used as a JSX component. Its return type 'ReactNode' is not a valid JSX element.

This error is occurring because TypeScript uses the definition of `JSX.Element` to check if something *can* be rendered as JSX. `React.ReactNode` contains things that aren't JSX, so it can't be used as a JSX element.

BUT - since TypeScript 5.1, this now works absolutely fine. It brought [some changes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-1-beta/#decoupled-type-checking-between-jsx-elements-and-jsx-tag-types) which improved the way that TypeScript inferred types from your React components.

### `React.ReactElement`

There's one more type that's worth mentioning - `React.ReactElement`.

It's an object type, defined like this:

```typescript
interface ReactElement<
  P,
  T extends string | JSXElementConstructor<any>
> {
  type: T;
  props: P;
  key: Key | null;
}
```

It represents the _object representation_ of the element you're rendering. If you were to console.log the output of a JSX expression, you'd see something like this:

```tsx
// { type: 'div', props: { children: [] }, key: null }
console.log(<div />);
```

You can use this in place of anywhere you'd type `JSX.Element` - it acts almost like an alias. In fact, many components are annotated like this:

```tsx
const Component = (): React.ReactElement => {
  return <div>Hello world</div>;
};
```

But, just like `JSX.Element`, it breaks when you attempt to pass in a string, number, or undefined as a child. You'll get an error:

> `Type 'string' is not assignable to type 'ReactElement<any, string | JSXElementConstructor<any>>'.`

```tsx
const Component = (): React.ReactElement => {
  // Type 'string' is not assignable to type
  // 'ReactElement<any, string | JSXElementConstructor<any>>'.
  return "123";
};
```

So, `React.ReactElement` is like an alias for `JSX.Element`. Same rules apply - you shouldn't use it.

### Conclusion

You should almost never use `JSX.Element` or `React.ReactElement` in your code. They're types used internally by TypeScript to represent the return type of JSX expressions.

Instead, use `React.ReactNode` to type the children of your components. I'd also suggest *not* annotating the return types of your components to avoid confusion - but if you're using TypeScript 5.1, go ahead.
