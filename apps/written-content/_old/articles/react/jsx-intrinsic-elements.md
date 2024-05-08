# What is `JSX.IntrinsicElements`?

`JSX.IntrinsicElements` is a type in TypeScript's global scope that defines which native JSX elements are in scope, and what props they require.

## Usage

```tsx twoslash
// @errors: 2741

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "my-custom-element": {
        id: string;
      };
    }
  }
}

<my-custom-element />;
```

In the example above, we:

1. Declare a global type using `declare global`.
2. Use the `JSX` namespace.
3. Create an `IntrinsicElements` interface.
4. Define a property on the interface with the name of the element we want to define.

The property that we define on the `IntrinsicElements` interface is the name of the element we want to define. The value of the property is the props that the element accepts.

This works because interfaces in the same scope _merge their declarations_. This means that the `IntrinsicElements` interface we define will merge with the one that TypeScript already knows about.

If you try to use an element that isn't defined on `JSX.IntrinsicElements`, you'll get an error:

> Property 'X' does not exist on type 'JSX.IntrinsicElements'.

```tsx twoslash
// @errors: 2339
const Component = () => {
  return <i-am-not-defined />;
};
```

## When will I use this?

Mostly, you won't modify `JSX.InstrinsicElements` yourself. Instead, the framework you're using will define the elements for you.

For instance, React uses `JSX.IntrinsicElements` to define the props for native HTML elements.

Pressing `cmd-click` on a JSX element in VSCode will take you to the definition of the element - and the definition is pretty enormous:

```ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      a: React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >;
      abbr: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      address: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      // ... hundreds more
    }
  }
}
```

Fundamentally, this is doing exactly the same thing as our code above. The name of the property is the name of the element, and the value is the props that the element accepts.

`React.DetailedHTMLProps` is just a utility type that creates the types that `a`, `abbr`, and `address` accept.
