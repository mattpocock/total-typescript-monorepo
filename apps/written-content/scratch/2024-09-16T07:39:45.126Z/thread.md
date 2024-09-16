So many folks are confused about TypeScript's `infer` keyword.

It's basically pattern matching for types. When you want to extract a type from another type, `infer` is awesome.

Let me explain 🧵

```ts twoslash
// Works like pattern matching
type GetSurname<T> = T extends `${string} ${infer Surname}`
  ? Surname
  : never;

type Surname = GetSurname<"John Doe">;
//   ^?
```

---

First, let's set the table. When folks hit an issue in TS, they often think `infer` will magically solve their problem.

`infer` is an incredibly narrow piece of syntax. It's used in a single place: in the `extends` clause of a conditional type.

```ts twoslash
type ConditionalType = "a" extends "b" ? "yes" : "no";
//                     ---------------
//                     infer can only be used here

type GenericType<T extends string> = T;
//               ----------------
//               not here

const genericFunction = <T extends string>(arg: T) => arg;
//                       ----------------
//                       not here
```

---

Its use case is when you want to extract a part of another type.

For instance, let's say we have a `Result` type coming from a library:

```ts twoslash
type Result<TData = never, TError = never> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };
```

---

Imagine that a type we don't control is declaring a `Success` result like this:

How do we access the type of `string` contained in `TData`?

```ts twoslash
// @errors: 2339
type Result<TData = never, TError = never> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };

// ---cut---
type Success = Result<string, never>;

type StringResult = Success["data"];
```

---

In this case, we could brute force it. We could use `Extract` to pull out the branch of the union that has `success: true`, then access the `data` property.

```ts twoslash
type Result<TData = never, TError = never> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };

// ---cut---
type Success = Result<string, never>;

type StringResult = Extract<
  Success,
  { success: true }
>["data"];

type Show = StringResult;
//   ^?
```

---

Then, we could make this more reusable by creating a generic type that does this for us.

For more info on this syntax, check out my book section on generic types:

https://www.totaltypescript.com/books/total-typescript-essentials/designing-your-types-in-typescript

```ts twoslash
type Result<TData = never, TError = never> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };

// ---cut---
type GetSuccessData<T extends Result<any, any>> = Extract<
  T,
  { success: true }
>["data"];

type Success = Result<string, never>;

type StringResult = GetSuccessData<Success>;
//   ^?
```

---

But there are some problems with this implementation. If we change the shape of `Result`, we have to change `GetSuccessData` as well.

It would be better if we could just look inside the type parameters passed to `Result`, and not have to rely on the shape of `Result` itself.

---

That's where `infer` comes in. It allows us to extract a type from another type, without having to know the shape of the type we're extracting from.

We can rewrite `GetSuccessData` to use `infer` like this:

```ts twoslash
type Result<TData = never, TError = never> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: TError;
    };

// ---cut---
type GetSuccessData<T> =
  T extends Result<infer Data> ? Data : never;

type Success = Result<string>;

type StringResult = GetSuccessData<Success>;
//   ^?

type Example =
  Extract<Success, { success: true }> extends Result<
    infer Data
  >
    ? Data
    : never;
```

---

This is most useful when you don't know the shape of the type you're working with. That means `infer` is mostly only needed in library settings.

In application code, you usually have more control over the types you're working with, so `infer` is less useful.

---

```ts twoslash
type MyComplexType<TFirst> = {
  first: TFirst;
};

// ---cut---
// Can extract the type of a type parameter
type Example = MyComplexType<string>;

type GetFirstParameter<T> =
  T extends MyComplexType<infer First> ? First : never;

type First = GetFirstParameter<Example>;
//   ^?
```
