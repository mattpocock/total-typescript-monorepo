Narrowing down the types of values is key knowledge for any TypeScript dev.

Here's 11 different ways you can do it. I bet you won't know 2 or 3 of them!

🧵

---

Narrowing with typeof:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | null,
) => {
  // 1. Typeof narrowing
  if (typeof input === "string") {
    console.log(input);
    //          ^?
  }
};
```

---

Narrowing with truthiness:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | undefined,
) => {
  // 2. Truthiness narrowing
  if (!input) {
    console.log(input);
    //          ^?
  }
};
```

---

Narrowing with instanceof is ideal for classes:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | Error,
) => {
  // 3. Instanceof narrowing
  if (input instanceof Error) {
    console.log(input);
    //          ^?
  }
};
```

---

Narrowing with 'in' is great for objects:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: { id: string } | { name: string },
) => {
  // 4. In narrowing
  if ("id" in input) {
    console.log(input);
    //          ^?
  }
};
```

---

Narrowing with type guards is a classic. Array.isArray works beautifully:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | number[],
) => {
  // 5. Type guard narrowing
  if (Array.isArray(input)) {
    console.log(input);
    //          ^?
  }
};
```

---

TypeScript is smart enough to pick up on the logical flow of your code. Throwing errors can help:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | undefined,
) => {
  // 6. Throwing errors to narrow
  if (typeof input !== "string") {
    throw new Error("Input is undefined");
  }

  console.log(input);
  //          ^?
};
```

---

Narrowing with a switch:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | number,
) => {
  // 7. Narrowing with a switch
  switch (typeof input) {
    case "string":
      console.log(input);
      //          ^?
      break;
  }
};
```

---

Returning early:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | null,
) => {
  // 8. Early returns
  if (typeof input !== "string") {
    return;
  }

  console.log(input);
  //          ^?
};
```

---

And with a ternary:

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | null,
) => {
  // 9. With a ternary
  typeof input === "string" ? console.log(input) : null;
  //                                      ^?
};
```

---

You can even narrow with functions that return never, like process.exit:

```ts twoslash
declare const process: {
  exit: (code: number) => never;
};

// ---cut---
const narrowMeSoftlyWithHisSong = (
  input: string | null,
) => {
  // 10. Narrowing with functions that return error
  if (input === null) {
    process.exit(1);
  }

  console.log(input);
  //          ^?
};
```

---

And even with switch(true):

```ts twoslash
const narrowMeSoftlyWithHisSong = (
  input: string | null,
) => {
  // 11. With switch(true)
  switch (true) {
    case typeof input === "string":
      console.log(input);
      //          ^?
      break;
  }
};
```
