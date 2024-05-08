---
summary: "Learn what the 'Implicit Any' error is and how to fix it in TypeScript. This error occurs when a variable or parameter is not given a specific type."
deps:
  - "any"
  - "ts-server"
---

# Implicit Any Error

The implicit any error occurs in TypeScript when a type is not specified and TypeScript automatically assigns it the `any` type. This is most common when a parameter in a function is not given a type. This error can cause issues in code as the `any` type can accept any value, so TypeScript gives you an error and catches it early.

Here's an example of when it might occur.

```typescript
// Parameter 'a' implicitly has an 'any' type.
const addTwoNumbers = (a, b) => {
  return a + b;
};
```

To fix the code, we need to specify the type of the 'a' and 'b' parameters. In this case, we should explicitly give them the `number` type:

```typescript
const addTwoNumbers = (a: number, b: number) => {
  return a + b;
};
```

Now, the error disappears!
