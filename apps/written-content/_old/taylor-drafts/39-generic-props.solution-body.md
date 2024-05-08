---
title: Add a Generic Type Argument to a Props Interface
description: By adding a generic type argument to a props interface, we can infer prop types.
---

The first thing we need to do is convert our `TableProps` into a generic type.

To do this we will add a placeholder `TRow` type parameter to the `TableProps` interface and replace the `rows: any[]`:

```typescript
interface TableProps<TRow> {
  rows: TRow[];
  renderRow: (row: any) => React.ReactNode;
}
```

This `TRow` is going to be used for both `row` and `renderRow` properties.

Next we need to pass it a type argument when we use it.

Inside of the `Table` component, add the `TRow` type argument to the `TableProps` type:

```typescript
// Error on TRow!
export const Table = (props: TableProps<TRow>) {
    ...
```

However, we have an error because `TRow` hasn't been instantiated anywhere.

We can can work around this by placing it at the start of the function signature, just like any other function.

Note that because we are in a `.tsx` file, we need to add a comma at the end of the type argument to let TypeScript know that this is not a JSX element.

```typescript
// Notice the comma!
export const Table = <TRow,>(props: TableProps<TRow>) {
  ...

// Alternative syntax
export const Table = <TRow extends unknown>(props: TableProps<TRow>) {
  ...
```

With these changes, the errors have gone away!

Hovering over the `Table` component, we can see that it now accepts `TRow` as a type argument and the `rows` data is being inferred correctly. 

```typescript
// Hovering over `rows`
TableProps<{ id: number; name: string; }>.rows: {
  id: number;
  name: string;
}[]
```

## Wrapping Up

Just like we can have generic functions, we can also have generic components. This is really powerful because components always return either React nodes or JSX elements. We'll delve deeper into the differences between these two in a later section, but for now, let's focus on the fact that they always return the same output.

Generics are incredibly useful, especially when you have different props that depend on each other.

In this example, we have `TableProps` inferring `TRow` from the rows being passed in. This can be thought of as a directional flow. The system understands that `TRow` is what's being passed in, and consequently, the type of the `renderRow` function gets inferred from whatever `rows` is.

This pattern is particularly beneficial for select components when you have multiple options. It's a testament to the power and flexibility that React brings to the table.