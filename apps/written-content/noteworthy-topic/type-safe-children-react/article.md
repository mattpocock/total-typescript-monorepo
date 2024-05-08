# Can You Make Children Type Safe In React?

If you've worked with TypeScript and JSX for enough time, you'll probably have run into a situation where you want to restrict a component's children to be of a certain type.

Let's say you're working on a `Select` component that takes `Option` components as children. You want to make sure that the `Option` components are the only children that can be passed to `Select`.

```tsx
// GOOD

<Select>
  <Option value="1">One</Option>
  <Option value="2">Two</Option>
  <Option value="3">Three</Option>
</Select>

// BAD

<Select>
  <div>One</div>
  <div>Two</div>
  <div>Three</div>
</Select>
```

It might feel like there are options available to you. Perhaps using `ReactElement`, or `ReactNode`, or `ReactChild`. But as it turns out, nothing works.

You can't tell TypeScript 'only use this type of component as children'.

## `<Component />` is Always `JSX.Element`

The reason for this comes down to the way that TypeScript interprets JSX.

Whenever TypeScript sees a JSX tag, it treats it as a `JSX.Element`. It doesn't matter what the component is, or what its props are. It's always a `JSX.Element`.

```tsx twoslash
const Component = () => <div />;

// ---cut---

const element1 = <Component />;
//    ^?

const element2 = <div />;
//    ^?

const element3 = <span />;
//    ^?
```

Let's imagine that we wanted to make our `Select` component only accept `Option` components as children. We might try to do something like this:

```tsx
type SelectProps = {
  children: ReactElement<OptionProps>[];
};
```

But our `Option` components always return `JSX.Element`.

## Attempting To Override The Return Type

This is even true if we use `as` to override the return type of the component:

```tsx twoslash
const Option = () =>
  (<option />) as any as "I should be showing below!";

const element = <Option />;
//    ^?
```

Funnily enough, this _does_ work if you call `Option()` manually:

```tsx twoslash
const Option = () =>
  (<option />) as any as "I should be showing below!";

// ---cut---

const element = Option();
//    ^?
```

Because this bypasses the JSX interpretation, TypeScript is able to understand that `Option` returns our special string.

But calling `Option()` manually is a terrible idea in React - it breaks all sorts of assumptions React makes about your code and will immediately cause bugs.

So, this approach just doesn't work.

## Conclusion

It's not possible to restrict the children of a React component to a certain type in TypeScript.

But here's something to ponder - would you even really want to?

The magic of React is that components can be composed in any way you like. By restricting the children of a component, you're breaking that composability.

Perhaps instead of restricting the type of children passed to a component, you could use a prop instead:

```tsx
<Select
  options={[
    { value: "1", label: "One" },
    { value: "2", label: "Two" },
    { value: "3", label: "Three" },
  ]}
/>
```

This way, you can still restrict the type of the children, but you're not breaking the composability of your components.
