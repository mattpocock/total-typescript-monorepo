Omit and Pick don't always work how you expect.

A small thread.

```ts twoslash
type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

/**
 * This ends up being {}, not
 * { name: string } | { price: number }
 */
type EntityWithoutId = Omit<User | Product, "id">;
//   ^?
```

---

Let's say we've got two different object types in our app: `User` and `Product`.

We then put those together into a union called `Entity`, which represents all the possible entities in our app.

```ts twoslash
type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

type Entity = User | Product;
```

---

Now, let's say we want to create a type called `EntityWithoutId`, which is the same as `Entity`, but without the `id` property.

We use the `Omit` type helper, passing `Entity` and the property we want to omit.

```ts twoslash
type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

type Entity = User | Product;
// ---cut---
type EntityWithoutId = Omit<Entity, "id">;
```

---

Because we're passing a union type to `Omit`, we expect to get a union type back.

The type we're expecting would look something like this.

```ts twoslash
type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

type Entity = User | Product;
// ---cut---
type EntityWithoutId =
  | { name: string } // Omit<User, 'id'>
  | { price: number }; // Omit<Product, 'id'>;
```

---

But we actually get... An empty object type.

```ts twoslash
type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

// ---cut---
type EntityWithoutId = Omit<User | Product, "id">;
//   ^?
```

---

To understand this, we need to understand how unions of objects work.

When you have a union of objects, you can only access the properties that are common to _all_ the objects in the union.

```ts twoslash
// @errors: 2339

type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

// ---cut---

const myFunc = (entity: User | Product) => {
  // We can access `id` because it's on both
  // `User` and `Product`.
  console.log(entity.id);
  //                 ^?

  // But not name, because it only
  // belongs to one of them.
  console.log(entity.name);
};
```

---

So we can think of `User | Product` as really just being `{ id: string }`, since that's the only property they have in common.

So once we `Omit` the `id` property, we're left with an empty object type.

```ts twoslash
type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

// ---cut---
type EntityWithoutId = Omit<User | Product, "id">;
//   ^?
```

---

So how do we get the type we want?

First, we need to start thinking of a union as a _list_ of things. If we could call `Omit` on each member of that list, we could get the type we want.

One way to do this in TypeScript is with an IIMT, described in this article:

https://www.totaltypescript.com/immediately-indexed-mapped-type

---

But another solution is a distributive conditional type.

By creating our own generic type called `DistributiveOmit`, we can tell TypeScript to perform the `Omit` on each member of the union.

```ts twoslash
type User = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  price: number;
};

// ---cut---

type DistributiveOmit<
  TObj,
  TKey extends PropertyKey
> = TObj extends any ? Omit<TObj, TKey> : never;

// Incredibly, we now get the type we want.
type EntityWithoutId = DistributiveOmit<
  // ^?
  User | Product,
  "id"
>;
```

---

You might be thinking - how the hell is this working?

Well, the `TObj extends any` is a conditional type. And conditional types run on _each member_ of a union.

So, `Omit` gets applied to both members of any union passed to `TObj`.

You can read more in the docs here:

https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types

```ts twoslash
type DistributiveOmit<
  TObj,
  TKey extends PropertyKey
> = TObj extends any ? Omit<TObj, TKey> : never;
```

---

So, I always keep a `DistributiveOmit` and `DistributivePick` around for these kinds of situations.

And yes, you can use them everywhere you'd use `Omit` and `Pick` normally.

Why don't they work like this by default?

Good question, I'd love to know.
