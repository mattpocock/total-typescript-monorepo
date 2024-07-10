```ts twoslash
// @errors: 2345
const requiresUppercase = (
  input: Uppercase<string>,
) => {
  console.log(input);
};
```

```ts twoslash
// @errors: 2345
const requiresUppercase = (
  input: Uppercase<string>,
) => {
  console.log(input);
};
// ---cut---
// Allows uppercase strings...
requiresUppercase("HELLO");

// but not others!
requiresUppercase("hEllO");
```
