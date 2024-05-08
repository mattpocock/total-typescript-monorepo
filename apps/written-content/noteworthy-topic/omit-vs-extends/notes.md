```ts twoslash
interface WithId {
  id: number;
}

interface UserWithoutId {
  name: string;
  email: string;
}

interface User extends WithId, UserWithoutId {}
```

```ts twoslash
interface User {
  id: number;
  name: string;
  email: string;
}

type UserWithoutId = Omit<User, "id">;
//   ^?
```
