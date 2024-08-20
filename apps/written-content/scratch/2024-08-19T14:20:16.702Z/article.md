I'm loving neverthrow.

Type-safe error handling in TypeScript without the bullshit.

Let me show you how it works 🧵

```ts twoslash
import { err, ok, safeTry } from "neverthrow";

// ---cut---
// 1. neverthrow knows the functions that might
// error, and those that won't.
const mightError = safeTry(function* () {
  if (Math.random() > 0.5) {
    yield* err("Error here!" as const).safeUnwrap();
  }

  return ok("Success!" as const);
});

// 2. Here, error is 'Error here!'.
console.log(mightError);
//          ^?
```

```ts twoslash
import { err, ok, safeTry } from "neverthrow";

// ---cut---
const wontError = safeTry(function* () {
  return ok("Success!" as const);
});

// 3. But here, it's never.
console.log(wontError);
//          ^?
```

---

There's only one concept you need to know in neverthrow: `Result`.

A `Result` represents the result of a computation that might fail.

It's either `Ok` with a value, or `Err` with an error.

```ts twoslash
import type { Result } from "neverthrow";

type MyFuncReturn = Result<string, Error>;
//                         ^^^^^^  ^^^^^
//                         Value   Error
```

---

You can use `Result` to annotate a function, saying that it might succeed or fail.

Instead of throwing errors, you return `err`.

And instead of returning values, you return `ok`.

```ts twoslash
import { err, ok, Result } from "neverthrow";

function mightError(): Result<string, Error> {
  if (Math.random() > 0.5) {
    return err(new Error("Error here!"));
  }

  return ok("Success!");
}
```

---

IMO, neverthrow's most powerful feature is `safeTry`.

It lets you write code like you normally do - only thinking about the happy path, acting as if it won't error.

But unlike your code, `safeTry` keeps track of all the errors that might occur, and lets you handle them later.

---

Let's take our `mightError` function from before. We know it either returns string, or errors.

Outside of `.safeTry`, we'd have to check if it's an error or not.

There are a couple of methods to do this: `isErr` and `isOk`. This is fine, but gets verbose quickly.

```ts twoslash
import { err, ok, Result } from "neverthrow";

function mightError(): Result<string, Error> {
  if (Math.random() > 0.5) {
    return err(new Error("Error here!"));
  }

  return ok("Success!");
}

// ---cut---
const result = mightError();

if (result.isErr()) {
  console.error(result.error);
  //              ^?
} else {
  console.log(result.value);
  //            ^?
}
```

---

Instead, let's call it inside `safeTry`.

`safeTry` uses generators, which have some magical properties in TypeScript.

We use a combination of `yield*` and `.safeUnwrap`, and BAM.

We get direct access to the value of the `Result` without having to check if it's an error or not.

```ts twoslash
import { err, ok, safeTry, Result } from "neverthrow";

function mightError(): Result<string, Error> {
  if (Math.random() > 0.5) {
    return err(new Error("Error here!"));
  }

  return ok("Success!");
}

// ---cut---
safeTry(function* () {
  const result = yield* mightError().safeUnwrap();
  //    ^?

  return ok(result);
});
```

---

Not only that, but `safeTry` STILL keeps track of the error from `mightError`, returning it as a new `Result`.

If you're a TS wizard, you're likely pretty amazed by this. A function returning one thing, and registering another thing in a parent scope? Insane.

```ts twoslash
import { err, ok, safeTry, Result } from "neverthrow";

function mightError(): Result<string, Error> {
  if (Math.random() > 0.5) {
    return err(new Error("Error here!"));
  }

  return ok("Success!");
}

// ---cut---
const resultOfSafeTry = safeTry(function* () {
  const result = yield* mightError().safeUnwrap();

  return ok(result);
});

console.log(resultOfSafeTry);
//          ^?
```

---

This gets extremely cool when you have multiple kinds of errors.

Here, we've set up some custom errors: `JSONParseError` and `LocalStorageError`.

We get to use `id` and `storage` without having to check them, then use `.mapErr` to handle the errors.

```ts twoslash
import { err, ok, safeTry, Result } from "neverthrow";

declare class JSONParseError extends Error {
  readonly name: "JSONParseError";
}
declare class LocalStorageError extends Error {
  readonly name: "LocalStorageError";
}

declare const jsonParse: (
  input: string,
) => Result<{ id: number }, JSONParseError>;
declare const getLocalStorage: (
  id: number,
) => Result<Storage, LocalStorageError>;

// ---cut---
const resultOfSafeTry = safeTry(function* () {
  // Inside safeTry, it's the happy path...
  const { id } =
    yield* jsonParse("{ id: 123 }").safeUnwrap();

  const storage = yield* getLocalStorage(id).safeUnwrap();

  return ok({ id, storage });
})
  // ...and the unhappy path is handled in .mapErr
  .mapErr((error) => {
    //       ^?

    if (error instanceof JSONParseError) {
      console.error("JSON parse error");
    } else if (error instanceof LocalStorageError) {
      console.error("Local storage error");
    }
  });
```

---

To compare, you just don't get the same safety with `try/catch`:

```ts twoslash
declare class JSONParseError extends Error {
  readonly name: "JSONParseError";
}
declare class LocalStorageError extends Error {
  readonly name: "LocalStorageError";
}

declare const jsonParse: (input: string) => { id: number };
declare const getLocalStorage: (id: number) => Storage;

// ---cut---
try {
  const { id } = jsonParse("{ id: 123 }");

  const storage = getLocalStorage(id);

  console.log({ id, storage });
} catch (error) {
  //     ^?
  // Unknown, ugh
}
```

---

So that's it. I love it. Here's the rundown:

- Everything that might error is captured in a Result.
- Results can be `Ok` or `Err`, and you use `err` and `ok` to create them.
- You can use `safeTry` to track errors in an ergonomic way.

And here's the repo:

https://github.com/supermacro/neverthrow
