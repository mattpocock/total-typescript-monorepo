```ts twoslash
// @errors: 2322
const example = <TUser extends { id: string }>(
  user?: TUser,
) => {
  const defaultUser: TUser = { id: "abc" };
};

// It's possible to define 'id' as a stricter
// version of string, so id: "abc" would not be
// a valid default
example<{ id: "def" }>();
```
