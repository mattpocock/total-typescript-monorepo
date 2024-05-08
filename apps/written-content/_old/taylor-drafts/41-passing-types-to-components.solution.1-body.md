---
title: Add a Type Argument to a Component
description: Just as you can pass a type argument to a function, you can pass a type argument to a component to override inference.
---

Before we get to the solution, let's look at an example for test purposes only– this is not something you should do in real life!

Here we create a new variable `result` by calling `Table` like a function:

```typescript
const result = Table({
  rows: [
    {
      id: "123",
    },
  ],
  renderRow: () => {
    return null
  }
});
```

When we hover over `Table`, we can see that we have inference which is good.

But how do we manually pass in a type to make sure that `rows` is what we want it to be?

When can add `User` as a type argument to `Table`, we can see that `id` will now error because it's expecting a number.

```typescript
const result = Table<User>({
  rows: [
    {
      id: "123",  // Error on id!
    },
  ],
  ...
```

If we update the `rows` to match the `User` interface, the errors go away.

This illustrates that type annotations work in regular functions.

Now we need to add a type annotation to our function component.

## Add a Type Annotation to a Component

The type annotation for a component goes right after the JSX element itself.

It might seem strange, but here's how it looks:

```typescript
<Table<User>
  // @ts-expect-error rows should be User[]
  rows={[1, 2, 3]}
  ...
```

Adding the `<User>` type argument to both of the `Table` components fixes the errors.

Just like a function where you can pass in types to override inference, you can do the same thing with components.

