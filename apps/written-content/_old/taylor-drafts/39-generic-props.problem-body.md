---
title: Applying Generics to Components
description: Generics are useful for components, especially in situations where different props depend on each other.
---

Now we'll move to to applying what we've learned about functions and type helpers to components.

Consider this `Table` component:

```typescript
interface TableProps {
  rows: any[];
  renderRow: (row: any) => React.ReactNode;
}

export const Table = (props: TableProps) => {
  return (
    <table>
      <tbody>
        {props.rows.map((row) => (
          <tr>{props.renderRow(row)}</tr>
        ))}
      </tbody>
    </table>
  )
}
```

The component takes in some rows and a function to render those rows into a React node. The `renderRow` function is called on each row, wrapping it in a `tr` element which then renders out all of the cells in that row.

Inside of the `Parent` component we use the `Table` component in a couple of different ways.

```typescript
const data = [
  {
    id: 1,
    name: "John",
  }
]

<Table rows={data} renderRow={(row) => <td>{row.name}</td>} />
```

In the second usage of the `Table` component we can see some issues with the test inside of the `renderRow` function:

```typescript
<Table
  rows={data}
  renderRow={(row) => {
    type test = Expect<Equal<typeof row, { id: number; name: string}>> // Error!
    return (
      <td>
        {
          // @ts-expect-error   // Error!
          row.doesNotExist
        }
      </td>
    );
  }}
/>
```

Even though we know the type of the data that's passing in, we can access properties like `row.doesNotExist` without getting proper warnings. This is dangerous.

## Challenge

Your task is to update the code to ensure that `rows` is the same type as `renderRow`, and somehow attach that so that the inference starts working on the `Table` component.

Hint: Notice that we are now working in a `.tsx` file, which you might need to take into account when solving this problem. 