```ts twoslash
interface User {
  name: string;
  age: number;
}

// ---cut---

const filterUsers = (
  users: Array<User | null>
) => {
  const filteredUsers = users.filter(Boolean);
};
```

```ts twoslash
interface User {
  name: string;
  age: number;
}

// ---cut---

import "@total-typescript/ts-reset";

const filterUsers = (
  users: Array<User | null>
) => {
  const filteredUsers = users.filter(Boolean);
  //    ^?
};
```
