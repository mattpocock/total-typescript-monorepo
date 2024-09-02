Let's talk about another crazy TypeScript trick: `T[number]`.

It looks like absolute insanity.

But I promise by the end of this thread, you'll know how it works.

Let's go 🧵

```ts twoslash
const roles = ["admin", "editor", "contributor"] as const;

type RolesAsType = typeof roles;

type Role = RolesAsType[number];
//   ^?
```

---

Let's take a slightly simpler example.

First, we'll define an array of some fixture data we might use in some tests.

```ts twoslash
const possibleResponses = [
  {
    status: 200,
    body: "Hello, world!",
  },
  {
    status: 404,
    body: "Not found",
  },
  {
    status: 500,
    body: "Internal server error",
  },
];
```

---

We can use typeof on `possibleResponses` to extract its type.

We can see that it is an array of objects with a `status` and `body` property.

But what if we want to remove the 'array' part of the type and just get to the object inside?

```ts twoslash
const possibleResponses = [
  {
    status: 200,
    body: "Hello, world!",
  },
  {
    status: 404,
    body: "Not found",
  },
  {
    status: 500,
    body: "Internal server error",
  },
];
// ---cut---
type PossibleResponses = typeof possibleResponses;
//   ^?
```

---

We can use this arcane-looking trick, `T[number]`, to extract the type of the array.

```ts twoslash
const possibleResponses = [
  {
    status: 200,
    body: "Hello, world!",
  },
  {
    status: 404,
    body: "Not found",
  },
  {
    status: 500,
    body: "Internal server error",
  },
];
type PossibleResponses = typeof possibleResponses;

// ---cut---
type PossibleResponse = PossibleResponses[number];
//   ^?
```

---

Why does this work? What even is this syntax?

Well, the syntax is an indexed access type. It's the way to access a property on a type.

A simpler version would be to grab a property from an object:

```ts twoslash
type NavbarProps = {
  onChange: () => void;
};

type OnChangeType = NavbarProps["onChange"];
//   ^?
```

---

By passing `number` to the indexed access type, we're saying "give me all the properties of the object that are accessed with numeric keys".

To demonstrate this, we can create an object with string keys, but a numeric index signature:

```ts twoslash
type ExampleObj = {
  // String keys
  stringKey1: "string-key";
  stringKey2: "string-key";

  // Numeric index signature
  [key: number]: "number-key";
};
```

---

We can then use `ExampleObj[number]` to extract only the numeric values from the object.

```ts twoslash
type ExampleObj = {
  // String keys
  stringKey1: "string-key";
  stringKey2: "string-key";

  // Numeric index signature
  [key: number]: "number-key";
};

type NumericValuesOnly = ExampleObj[number];
//   ^?
```

---

Keen observers might be looking at this with scepticism. Is this trick really useful?

Surely, you would just create the type _first_, then use it in your application.

No need to extract it from an array.

```ts twoslash
type Response = {
  status: number;
  body: string;
};

const possibleResponses: Response[] = [
  {
    status: 200,
    body: "Hello, world!",
  },
  {
    status: 404,
    body: "Not found",
  },
  {
    status: 500,
    body: "Internal server error",
  },
];
```

---

Well, this trick comes into its own in a few places.

It goes without saying that it's useful in library code.

But it's also great when you're building your own enums from arrays, like in the first example.

```ts twoslash
const roles = ["admin", "editor", "contributor"] as const;

type RolesAsType = typeof roles;

type Role = RolesAsType[number];
//   ^?
```

---

By the way, this example works because `roles` is marked `as const`, which makes TypeScript infer the literal values of the array.

Without it, TypeScript would infer the type as `string[]`:

```ts twoslash
const roles = ["admin", "editor", "contributor"];

type RolesAsType = typeof roles;

type Role = RolesAsType[number];
//   ^?
```

---

Deriving types from values is an extremely powerful concept - so much so that I wrote an entire chapter of my book on it.

https://www.totaltypescript.com/books/total-typescript-essentials/deriving-types

---

So, that's `T[number]` in TypeScript. If you want more tips like this, check out my newsletter. It's chock-full of gorgeous TypeScript goodies.

https://www.totaltypescript.com/newsletter
