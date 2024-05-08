The way React's `forwardRef` is implemented in TypeScript has some annoying limitations. The biggest is that it disables inference on generic components.

## What Is A Generic Component?

A common use case for a generic component is a `Table`:

```tsx twoslash
const Table = <T,>(props: {
  data: T[];
  renderRow: (row: T) => React.ReactNode;
}) => {
  return (
    <table>
      <tbody>
        {props.data.map((item, index) => (
          <props.renderRow key={index} {...item} />
        ))}
      </tbody>
    </table>
  );
};
```

Here, when we pass in an array of something to `data`, it will then infer that type in the argument passed to the `renderRow` function.

```tsx twoslash
const Table = <T,>(props: {
  data: T[];
  renderRow: (row: T) => React.ReactNode;
}) => {
  return (
    <table>
      <tbody>
        {props.data.map((item, index) => (
          <props.renderRow key={index} {...item} />
        ))}
      </tbody>
    </table>
  );
};

// ---cut---

<Table
  // 1. Data is a string here...
  data={["a", "b"]}
  // 2. So ends up inferring as a string in renderRow.
  renderRow={(row) => {
    //        ^?
    return <tr>{row}</tr>;
  }}
/>;

<Table
  // 3. Data is a number here...
  data={[1, 2]}
  // 4. So ends up inferring as a number in renderRow.
  renderRow={(row) => {
    //        ^?
    return <tr>{row}</tr>;
  }}
/>;
```

This is really helpful, because it means that without _any_ extra annotations, we can get type inference on the `renderRow` function.

## The Problem With `forwardRef`

The issue comes in when we try to add a `ref` to our `Table` component:

```tsx twoslash
const Table = <T,>(
  props: {
    data: T[];
    renderRow: (row: T) => React.ReactNode;
  },
  ref: React.ForwardedRef<HTMLTableElement>
) => {
  return (
    <table ref={ref}>
      <tbody>
        {props.data.map((item, index) => (
          <props.renderRow key={index} {...item} />
        ))}
      </tbody>
    </table>
  );
};

const ForwardReffedTable = React.forwardRef(Table);
```

This all looks fine so far, but when we use our `ForwardReffedTable` component, the inference we saw before no longer works.

```tsx twoslash
const Table = <T,>(
  props: {
    data: T[];
    renderRow: (row: T) => React.ReactNode;
  },
  ref: React.ForwardedRef<HTMLTableElement>
) => {
  return (
    <table ref={ref}>
      <tbody>
        {props.data.map((item, index) => (
          <props.renderRow key={index} {...item} />
        ))}
      </tbody>
    </table>
  );
};

const ForwardReffedTable = React.forwardRef(Table);

// ---cut---

<ForwardReffedTable
  // 1. Data is a string here...
  data={["a", "b"]}
  // 2. But ends up being inferred as unknown.
  renderRow={(row) => {
    //        ^?
    return <tr />;
  }}
/>;

<ForwardReffedTable
  // 3. Data is a number here...
  data={[1, 2]}
  // 4. But still ends up being inferred as unknown.
  renderRow={(row) => {
    //        ^?
    return <tr />;
  }}
/>;
```

This is extremely frustrating. But, it can be fixed.

## The Solution

We can redefine `forwardRef` using a different type definition, and it'll start working.

Here's the new definition:

```tsx twoslash
function fixedForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return React.forwardRef(render) as any;
}
```

We can change our definition to use `fixedForwardRef`:

```tsx twoslash
function fixedForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return React.forwardRef(render) as any;
}

const Table = <T,>(
  props: {
    data: T[];
    renderRow: (row: T) => React.ReactNode;
  },
  ref: React.ForwardedRef<HTMLTableElement>
) => {
  return (
    <table ref={ref}>
      <tbody>
        {props.data.map((item, index) => (
          <props.renderRow key={index} {...item} />
        ))}
      </tbody>
    </table>
  );
};

// ---cut---

const ForwardReffedTable = fixedForwardRef(Table);
```

Suddenly, it just starts working:

```tsx twoslash
function fixedForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return React.forwardRef(render) as any;
}

const Table = <T,>(
  props: {
    data: T[];
    renderRow: (row: T) => React.ReactNode;
  },
  ref: React.ForwardedRef<HTMLTableElement>
) => {
  return (
    <table ref={ref}>
      <tbody>
        {props.data.map((item, index) => (
          <props.renderRow key={index} {...item} />
        ))}
      </tbody>
    </table>
  );
};

const ForwardReffedTable = fixedForwardRef(Table);

// ---cut---

<ForwardReffedTable
  data={["a", "b"]}
  renderRow={(row) => {
    //        ^?
    return <tr />;
  }}
/>;

<ForwardReffedTable
  data={[1, 2]}
  renderRow={(row) => {
    //        ^?
    return <tr />;
  }}
/>;
```

This is my recommended solution - redefine `forwardRef` to a new function with a different type that actually works.
