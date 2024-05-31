.indexOf also broken

```ts twoslash
// @errors: 2345
const roles = ["admin", "editor", "contributor"] as const;
//    ^?

const isValidRole = (role: string) => {
  return roles.includes(role);
};
```
