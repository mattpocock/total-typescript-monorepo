---
height: 1150
width: 1400
posted: 2024-06-20
---

```ts !!
type User = {
  name: string;
  age: number;
};

type AdminUser = {
  name: string;
  age: number;
};

type UserWithPerms = {
  name: string;
  age: number;
  permissions: string[];
};
// ---cut---

// Let's imagine we have some complicated type
// that's an intersection of multiple types.
type Intersected = AdminUser & UserWithPerms & User;
```

```ts !!
type User = {
  name: string;
  age: number;
};

type AdminUser = {
  name: string;
  age: number;
};

type UserWithPerms = {
  name: string;
  age: number;
  permissions: string[];
};
// ---cut---
// You can try hovering the type to see what it
// contains, but it just shows the intersection.
type Intersected = AdminUser & UserWithPerms & User;
//   ^?
```

```ts !!
type User = {
  name: string;
  age: number;
};

type AdminUser = {
  name: string;
  age: number;
};

type UserWithPerms = {
  name: string;
  age: number;
  permissions: string[];
};
// ---cut---
// So, let's add the `Prettify` helper.
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type Intersected = AdminUser & UserWithPerms & User;
```

```ts !!
type User = {
  name: string;
  age: number;
};

type AdminUser = {
  name: string;
  age: number;
};

type UserWithPerms = {
  name: string;
  age: number;
  permissions: string[];
};
// ---cut---
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type Intersected = AdminUser & UserWithPerms & User;

// With the `Prettify` helper, the hover overlay
// shows the actual readout of the types.
type Show = Prettify<Intersected>;
//   ^?
```

```ts !!
type User = {
  name: string;
  age: number;
};

type AdminUser = {
  name: string;
  age: number;
};

type UserWithPerms = {
  name: string;
  age: number;
  permissions: string[];
};
// ---cut---
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

interface Intersected
  extends AdminUser,
    UserWithPerms,
    User {}

// It even works with interfaces!
type Show = Prettify<Intersected>;
//   ^?
```
