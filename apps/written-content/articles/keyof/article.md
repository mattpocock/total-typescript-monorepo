# Problem

```ts twoslash
type User = {
  id: string;
  name: string;
};

const trackUserAttribute = (user: User, attribute: "id" | "name") => {};
```

# Solution 1

```ts twoslash
type User = {
  id: string;
  name: string;
};

const trackUserAttribute = (user: User, attribute: keyof User) => {};
```

# Solution 2

```ts twoslash
type User = {
  id: string;
  name: string;
};

type UserKey = keyof User;

const trackUserAttribute = (user: User, attribute: UserKey) => {};
```
