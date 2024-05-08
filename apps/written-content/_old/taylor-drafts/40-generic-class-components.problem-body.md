---
title: Generics in Class Components
description: There are still class components in legacy codebases, so it's important to understand how to make them generic.
---

Class components still exist in legacy codebases, and it's important to understand how to convert them to be generic.

Here we have another `Table` component, but this time it's a class component:

```typescript
interface TableProps {
  rows: any[];
  renderRow: (row: any) => ReactNode;
}

export class Table extends React.Component<TableProps> {
  render(): ReactNode {
    return (
      <table>
        <tbody>
          {this.props.rows.map((row) => (
            <tr>{this.props.renderRow(row)}</tr>
          ))}
        </tbody>
      </table>
    );
  }
}
```

The `Table` class extends `React.Component`, a classic approach, and we're passing in `TableProps` as the props for our React components.

Down in the `Parent` component, we're encountering the same issue as before where we're not able to infer the type of `row`, and we are able to access properties that don't exist.

## Challenge

Your challenge is to replicate the same process from the previous lesson: find a way to make the table generic, and pass in `TRow` into `TableProps`.
