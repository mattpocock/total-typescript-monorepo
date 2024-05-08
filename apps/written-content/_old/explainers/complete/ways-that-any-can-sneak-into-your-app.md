## Empty Arrays

```ts twoslash
// @errors: 7034 7005
const foo = () => {
  const result = [];
  //    ^?

  return result;
};
```
