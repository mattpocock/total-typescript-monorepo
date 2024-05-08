---
title: Passing Types to Components
description: 


// DELETE THE BELOW WHEN DONE


Possible Titles:
  1. Ensuring Type Safety in Functional Components: A User Table Case Study
  2. Enforcing Strong Typing in React Components: Solving Data Inconsistencies in Tables
  3. Leveraging Component Types to Prevent Errors: The User Table Data Mismatch Challenge

Possible Descriptions:
  1. Discover how to use type enforcement in React components to address data inconsistencies in a user table, preserving data integrity.
  2. Learn how to pass types as arguments to React components to catch and resolve errors caused by inconsistent data in tables.
  3. Dive into the challenge of enforcing type safety in a user table component, ensuring that the correct data types are used for better reliability.
---


# Working with TypeScript and React Components

We're back to the functional `Table` component that we've seen before.

This time, it's the tests that have changed.

In the first usage of the `Table` component, we want the `rows` to be an array of `User`, but this is currently failing:

```typescript
  <Table
    // @ts-expect-error rows should be User[]
    rows={[1, 2, 3]}
    renderRow={(row) => {
      type test = Expect<Equal<typeof row, User>>;
      return <td>{row.name}</td>;
    }}
  />
```

In the second usage, we have an error because we are accidentally passing in an `id` of `string`. 


```typescript

    <Table
    rows={[
      {
        id: 1,
        name: "John",
        age: 30,
      },
      {
        // @ts-expect-error id should be string
        id: "2",
        name: "Jane",
        age: 30,
      },
    ]}
    renderRow={(row) => {
      type test = Expect<Equal<typeof row, User>>;
      return <td>{row.name}</td>;
    }}
  ></Table>
```

When hovering over `row` in the `renderRow` function, we see that we have two different objects competing:

```typescript
row: {
  id: number;
  name: string;
  age: number;
} | {
  id: string;
  name: string;
  age: number;
}
```

## Challenge

Your challenge is to find a way to pass a specific type argument when instantiating the component to enforce the `User` type for our data. 

```typescript
interface User {
  id: number;
  name: string;
  age: number;
}
```

You'll know it works when the error messages disappear!