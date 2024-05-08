```ts twoslash
function invariant(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error("Assertion failed");
  }
}

const maybeString = (x: string | undefined) => {
  invariant(x !== undefined);

  x.toUpperCase();
};
```
