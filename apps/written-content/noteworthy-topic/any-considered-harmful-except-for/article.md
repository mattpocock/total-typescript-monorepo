# `any` Considered Harmful, Except For These Cases

`any` is an extremely powerful type in TypeScript. It lets you treat a value as if you were in JavaScript, not TypeScript. This means that it disables all of TypeScript's features - type checking, autocomplete, and safety.

```ts twoslash
const myFunction = (input: any) => {
  input.someMethod();
};

myFunction("abc"); // This will fail at runtime!
```

Using `any` is rightly considered harmful by most of the community. There are [ESLint rules](https://typescript-eslint.io/rules/no-explicit-any/) to prevent its use. This can turn developers off using `any` entirely.

However, there are a few advanced cases where `any` is always the right choice. Here are three of them:

## Type Argument Constraints

Let's imagine we wanted to implement the `ReturnType` utility in TypeScript. This utility takes a function type and returns the type of its return value.

We need to create a [generic type](https://www.totaltypescript.com/no-such-thing-as-a-generic#generic-types) which takes a function type as a type argument. If we restricted ourselves to not use `any`, we might use `unknown`:

```ts twoslash
// @moduleDetection: force
type ReturnType<T extends (...args: unknown[]) => unknown> =
  // Not important for our explanation:
  T extends (...args: unknown[]) => infer R ? R : never;
```

It's not important to understand _all_ of this code, only the constraint - `T extends (...args: unknown[]) => unknown`. What we're saying here is that only functions which accept an arguments array of `unknown[]` and return `unknown` are allowed.

It seems to work fine for functions which have no arguments:

```ts twoslash
// @moduleDetection: force
type ReturnType<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => infer R ? R : never;

// ---cut---

const myFunction = () => {
  console.log("Hey!");
};

type Result = ReturnType<typeof myFunction>;
//   ^?
```

But it stops working as soon as we add an argument:

```ts twoslash
// @moduleDetection: force
// @errors: 2344
type ReturnType<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => infer R ? R : never;

// ---cut---

const myFunction = (input: string) => {
  console.log("Hey!");
};

type Result = ReturnType<typeof myFunction>;
```

In fact, it only works if we change the parameter of our function to `input: unknown`:

```ts twoslash
// @moduleDetection: force
type ReturnType<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => infer R ? R : never;

// ---cut---

const myFunction = (input: unknown) => {
  console.log("Hey!");
};

type Result = ReturnType<typeof myFunction>;
//   ^?
```

So accidentally, we've created a `ReturnType` function that only works on functions which accept `unknown` as an argument. This is not what we wanted. We wanted it to work on any function.

The solution is to use `any[]` as the type argument constraint:

```ts twoslash
// @moduleDetection: force
type ReturnType<T extends (...args: any[]) => any> =
  T extends (...args: any[]) => infer R ? R : never;

const myFunction = (input: string) => {
  console.log("Hey!");
};

type Result = ReturnType<typeof myFunction>;
//   ^?
```

Now it works as expected. We're declaring that we don't care what types the function accepts - it could be anything.

The reason this is safe is because we're deliberately declaring a wide type. We're saying "I don't care what the function accepts, as long as it's a function". This is a safe use of `any`.

## Returning Conditional Types From Generic Functions

In some places, TypeScript's narrowing abilites are not as good as we'd like them to be. Let's say we want to create a function which returns different types based on a condition:

```ts twoslash
const youSayGoodbyeISayHello = (
  input: "hello" | "goodbye"
) => {
  if (input === "goodbye") {
    return "hello";
  } else {
    return "goodbye";
  }
};

const result = youSayGoodbyeISayHello("hello");
//    ^?
```

This function isn't really doing what we want it to. We want it to return the type `"goodbye"` when we pass in `"hello"`. But currently, `result` is typed as `"hello" | "goodbye"`.

We can fix this by using a conditional type:

```ts twoslash
// @noErrors
const youSayGoodbyeISayHello = <
  TInput extends "hello" | "goodbye"
>(
  input: TInput
): TInput extends "hello" ? "goodbye" : "hello" => {
  if (input === "goodbye") {
    return "hello";
  } else {
    return "goodbye";
  }
};

const goodbye = youSayGoodbyeISayHello("hello");
//    ^?
const hello = youSayGoodbyeISayHello("goodbye");
//    ^?
```

We've added a conditional type to the return type of the function which mirrors our runtime logic. If `TInput`, inferred from the runtime argument `input`, is `"hello"`, we return `"goodbye"`. Otherwise, we return `"hello"`.

But there's a problem. I've deliberately disabled the errors in the snippet above. Let's see what happens when we enable them:

```ts twoslash
// @errors: 2322
const youSayGoodbyeISayHello = <
  TInput extends "hello" | "goodbye"
>(
  input: TInput
): TInput extends "hello" ? "goodbye" : "hello" => {
  if (input === "goodbye") {
    return "hello";
  } else {
    return "goodbye";
  }
};
```

Ouch. TypeScript doesn't seem to be matching up the conditional type with the runtime logic. `"hello"` or `"goodbye"` can't be returned from the function.

We can fix this by using `as`, and forcing it to be the correct conditional type:

```ts twoslash
// @errors: 2322
const youSayGoodbyeISayHello = <
  TInput extends "hello" | "goodbye"
>(
  input: TInput
): TInput extends "hello" ? "goodbye" : "hello" => {
  if (input === "goodbye") {
    return "hello" as TInput extends "hello"
      ? "goodbye"
      : "hello";
  } else {
    return "goodbye" as TInput extends "hello"
      ? "goodbye"
      : "hello";
  }
};
```

We can make this nicer by extracting that logic to a common generic type:

```ts twoslash
// @errors: 2322

type YouSayGoodbyeISayHello<
  TInput extends "hello" | "goodbye"
> = TInput extends "hello" ? "goodbye" : "hello";

const youSayGoodbyeISayHello = <
  TInput extends "hello" | "goodbye"
>(
  input: TInput
): YouSayGoodbyeISayHello<TInput> => {
  if (input === "goodbye") {
    return "hello" as YouSayGoodbyeISayHello<TInput>;
  } else {
    return "goodbye" as YouSayGoodbyeISayHello<TInput>;
  }
};
```

But in these situations, it often makes more sense to use `as any`:

```ts twoslash
// @errors: 2322
const youSayGoodbyeISayHello = <
  TInput extends "hello" | "goodbye"
>(
  input: TInput
): TInput extends "hello" ? "goodbye" : "hello" => {
  if (input === "goodbye") {
    return "hello" as any;
  } else {
    return "goodbye" as any;
  }
};
```

Yes, this does make our function less type-safe. We could accidentally return `"bonsoir"` from the function instead.

But in these situations, it's often better to use `as any` and add a unit test for this function's behavior. Because of TypeScript's limitations in checking this stuff, this is often as close as you'll get to type safety.

There are several other use cases like this, where inside generic functions you need to use `any` to get around TypeScript's limitations. To me, this is fine.

## Conclusion

A question remains: should you ban `any` from your codebase? I think, on balance, the answer should be yes. You should turn on the ESLint rule which prevents its use, and you should avoid it wherever possible.

However, there _are_ cases where `any` is needed. They're worth using `eslint-disable` to get around them. So, bookmark this article, and attach it to your PR's when you feel the need to use it.

Have you spotted any other legitimate use cases for `any`? Head to the feedback form at the top of the page to let me know!
