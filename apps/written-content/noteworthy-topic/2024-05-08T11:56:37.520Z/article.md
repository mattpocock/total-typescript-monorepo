```ts twoslash
type User = {
  readonly id: string;
  name: string;
  phone?: string;
  email: string;
};

type Keys = keyof User;

type NewUser = {
  [K in Keys]: User[K];
};

type Example = NewUser;
//             ^?
```
