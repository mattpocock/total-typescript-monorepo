Sometimes, TypeScript's narrowing kind of sucks.

The prime suspect? Boolean.

Let's take a look at why. 🧵

```ts twoslash
const myFunc = (input: string | null) => {
  if (!!input) {
    // Narrows to string. Nice.
    console.log(input);
    //          ^?
  }

  if (Boolean(input)) {
    // Doesn't narrow. WHYYYYYYYYYYYYYYYYY
    console.log(input);
    //          ^?
  }
};
```

---

Let's explain the code above. `myFunc` takes in a string or null. We want to ensure it's not null for some reason.

So, we can use an if statement to check if it's truthy. If it's truthy, it ain't null.

We can do that in MANY different ways:

```ts twoslash
declare const input: string | null;

// ---cut---
if (!!input) {
  console.log(input);
  //          ^?
}

if (input !== null) {
  console.log(input);
  //           ^?
}

// Heh, stupid JavaScript.
if (typeof input !== "object") {
  console.log(input);
  //           ^?
}
```

---

But if we try it with `Boolean`, it doesn't work. We just get string | null, even though this is basically equivalent to `!!input`.

Why?

```ts twoslash
declare const input: string | null;

// ---cut---
if (Boolean(input)) {
  console.log(input);
  //          ^?
}
```

---

Well, TypeScript doesn't see `Boolean` as something that can narrow the type of a value.

To TypeScript, it's just a function that returns a boolean. We can see this by hovering over `Boolean`, and grabbing its return type.

It's `boolean`, but it's not narrowing the type of the value.

```ts twoslash
console.log(Boolean);
//          ^?

type WhatBooleanReturns = ReturnType<BooleanConstructor>;
//   ^?
```

---

TypeScript does have the ability to handle functions that contain narrowing logic. We can create an 'isString' function that checks if something is a string:

```ts twoslash
declare const input: string | null;

// ---cut---
const isString = (value: unknown) => {
  return typeof value === "string";
};

if (isString(input)) {
  console.log(input);
  //          ^?
}
```

---

But, for some reason, TypeScript hasn't applied this logic to the Boolean function.

It means the fabled `.filter(Boolean)` would just work, without needing to use `ts-reset`:

```ts twoslash
const arr = [1, 2, 3, null, undefined];

// Doesn't narrow to number[], sad times.
const result = arr.filter(Boolean);
//    ^?
```
