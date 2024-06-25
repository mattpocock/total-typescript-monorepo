```ts !!
const shoppingCart = {
  items: [],
};
```

```ts !!
// @errors: 2345
const shoppingCart = {
  items: [],
};

shoppingCart.items.push("Apple");
```

```ts !!
// @errors: 2345
const shoppingCart = {
  items: [],
};

console.log(shoppingCart.items);
//                       ^?
```

```ts !!
// @errors: 2345
type ShoppingCart = {
  items: string[];
};

const shoppingCart: ShoppingCart = {
  items: [],
};
```

```ts !!
// @errors: 2345
type ShoppingCart = {
  items: string[];
};

const shoppingCart: ShoppingCart = {
  items: [],
};

shoppingCart.items.push("Apple"); // No error!
```

```ts !!
// @errors: 2345
type User = {
  id: string;
  name: string;
};
```

```ts !!
// @errors: 2345
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  roles: string[];
};
```

```ts !!
// @errors: 2345
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  roles: string[];
};

type FinalUser = User & UserWithPerms;
```

```ts !!
// @errors: 2345
type User = {
  id: string; // Conflicts!
  name: string;
};

type UserWithPerms = {
  id: number; // Conflicts!
  roles: string[];
};

type FinalUser = User & UserWithPerms;
```

```ts !!
// @errors: 2322
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  id: number;
  roles: string[];
};

// ---cut---
type FinalUser = User & UserWithPerms;

const user: FinalUser = {
  id: 1,
  name: "John",
  roles: ["admin"],
};
```

```ts !!
// @errors: 2322
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  id: number;
  roles: string[];
};

type FinalUser = User & UserWithPerms;
```

```ts !!
// @errors: 2322
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  id: number;
  roles: string[];
};

type FinalUser = {
  id: User["id"] & UserWithPerms["id"];
  name: User["name"];
  roles: UserWithPerms["roles"];
};
```

```ts !!
// @errors: 2322
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  id: number;
  roles: string[];
};

// ---cut---
type FinalUser = {
  id: User["id"] & UserWithPerms["id"];
  name: User["name"];
  roles: UserWithPerms["roles"];
};

type Id = FinalUser["id"];
//   ^?
```

```ts !!
// @errors: 2322
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  id: number;
  roles: string[];
};

type FinalUser = User & UserWithPerms;
```

```ts !!
// @errors: 2320
type User = {
  id: string;
  name: string;
};

type UserWithPerms = {
  id: number;
  roles: string[];
};

interface FinalUser extends User, UserWithPerms {}
```

```ts !!
const myFunc = (id: string) => {};
```

```ts !!
const myFunc = (id: string) => {
  if (typeof id !== "string") {
    console.log(id);
  }
};
```

```ts !!
const myFunc = (id: string) => {
  if (typeof id !== "string") {
    console.log(id);
    //          ^?
  }
};
```

```ts !!
const myFunc = (id: string | number) => {
  if (typeof id !== "string") {
    console.log(id);
    //          ^?
  }
};
```
