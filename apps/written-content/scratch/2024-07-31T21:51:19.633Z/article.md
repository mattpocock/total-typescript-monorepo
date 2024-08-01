```ts twoslash
export const loader = async () => {
  if (Math.random() > 0.5) {
    return {
      status: "success",
      id: 123,
    };
  } else {
    return {
      status: "different-sort-of-success",
      someOtherProp: "hello",
    };
  }
};

type Returned = Awaited<ReturnType<typeof loader>>;
//   ^?
```

```ts twoslash
export const loader = async () => {
  if (Math.random() > 0.5) {
    return {
      status: "success" as const,
      id: 123,
    };
  } else {
    return {
      status: "different-sort-of-success" as const,
      someOtherProp: "hello",
    };
  }
};

type Returned = Awaited<ReturnType<typeof loader>>;
//   ^?
```
