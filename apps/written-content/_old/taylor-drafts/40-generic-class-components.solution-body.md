---
title: Converting a Class Component to be Generic
description: Props work the same whether we're using functional components or class components. It's just the generic syntax that's different.
---

Like before, we'll bring `TRow` into `TableProps`:

```typescript
interface TableProps<TRow> {
  rows: TRow[];
  renderRow: (row: TRow) => ReactNode;
}
```

Then we'll add `TRow` to the `Table` component:

```typescript
// Error on TRow!
export class Table extends React.Component<TableProps<TRow>> {
  ...
```

But we have an error that the `TRow` name cannot be found. 

In order to instantiate `TRow`, we'll add it next to the `Table`:

```typescript
export class Table<TRow> extends React.Component<TableProps<TRow>> {
  ...
```

This approach works perfectly! 

Our `Table` now has `TRow` in the generic slot, and we have achieved successful inference for the `rows` and `renderRow` props.

It's important to note that props work the same whether we're using functional components or class components.

In fact, even outside of React, generic classes have a plethora of applications. They can represent a multitude of different dynamic data structures, making them an incredibly versatile tool.