```ts twoslash
type User = { id: string; name: string };

type Example = Omit<User, "id">;
//   ^?
```
