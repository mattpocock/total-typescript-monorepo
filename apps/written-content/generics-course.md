# VIDEO: There is no such thing as a generic

I want to start this course with an idea that will change the way you think about generics.

There is no such thing as a 'generic'.

There are **generic types**, **generic functions**, and **generic classes**.

There are **type arguments** and **type parameters**.

You cannot 'pass' a generic, 'declare' it, or 'infer' it.

In other words, 'generic' is not a noun, it's an adjective.

## "A generic"

People think of 'a generic' as _something_ in TypeScript.

You might look at the code below and say 'we're passing a generic to useState'.

```ts twoslash
import { useState } from "react";

useState<string>();
//       ^^^^^^ Generic
```

You might also say 'we're passing two generics to `Record`':

```ts twoslash
type NumberRecord = Record<string, number>;
//                         ^^^^^^  ^^^^^^ Generics
```

How about '`Maybe` has two generics'?

```ts twoslash
type Maybe<T> = T | null | undefined;
//         ^ Generic
```

People look at the angle bracket syntax and think 'that's a generic'. But because generics can appear on functions, function calls, types, and type declarations, it's not clear what 'a generic' even is.

That's why it's such a hard concept for folks to grasp - the word is too overloaded.

So, what terms should we use instead?

## Type Arguments

How would we describe this code if we couldn't use the word 'generic'?

```ts twoslash
import { useState } from "react";

useState<string>();
```

We're not passing a 'generic' to `useState`. We are passing it a **type argument**. And the **type argument** we're passing is `string`.

How about `Record`?

```ts twoslash
type NumberRecord = Record<string, number>;
```

We're passing two **type arguments** to `Record`. The first **type argument** is `string`, and the second **type argument** is `number`.

So - a type argument works just like a function argument. We can pass it to a function, class, or type.

But not all types, functions, and classes can receive type arguments:

```ts twoslash
// @errors: 2315 2558
type Example = PropertyKey<string>;

encodeURIComponent<string>();

new Event<string>();
```

So how do we know which ones can receive them?

You have generic types:

```ts twoslash
// Generic Type
type Maybe<T> = T | undefined | null;
//         ^ Type Parameter

type MaybeString = Maybe<string>;
//                       ^^^^^^ Type Argument
```

And generic functions.

```ts twoslash
// Generic Function
const uniqueArray = <T>(array: T[]) => {
  //                 ^ Type Parameter

  return Array.from(new Set(array));
};

const uniqueStrings = uniqueArray<string>(["a", "b", "a"]);
//                                ^^^^^^ Type Argument
```

## Type Parameters

Let's look at our `Maybe<T>` from earlier.

```ts twoslash
type Maybe<T> = T | null | undefined;
```

Here, `Maybe` is declaring a **type parameter**. The **type parameter** is `T`.

This means that `Maybe` MUST be passed a type argument. If we don't pass it a type argument, we get an error:

```ts twoslash
// @errors: 2314
type Maybe<T> = T | null | undefined;

// ---cut---

type Example = Maybe;
```

So, a **type parameter** is like a function parameter. It declares that you can pass a type argument to the type, function, or class.

## Generic Types

Let's bring the phrase 'generic' back into our vocabulary and give it a proper definition.

> **generic** - _adj_: a type, function, or class that declares one or more type parameters.

So, `Maybe` is a generic type because it declares a type parameter.

And `PropertyKey`, which we saw earlier, is NOT generic. Even the error says so.

```ts twoslash
// @errors: 2315
type Example = PropertyKey<string>;
```

So, generic types are simply types that declare type parameters.

## Generic Functions and Generic Classes

Functions and classes can also declare type parameters. When they do, they become generic functions and generic classes and can receive type arguments.

```ts twoslash
const myFunc = <T>() => {
  //            ^ Type Parameter
};

myFunc<string>();
//     ^^^^^^ Type Argument
```

```ts twoslash
class MyClass<T> {
  //          ^ Type Parameter
  // implementation...
}

new MyClass<string>();
//          ^^^^^^ Type Argument
```

This can be used in all sorts of ways. By far the most popular is to provide type information to third-party libraries. In the example below, how would `useState` know what type it's supposed to be returning?

```ts twoslash
import { useState } from "react";

const [message, setMessage] = useState(); // message is undefined
```

It can't - so we have to pass a type argument to it.

```ts twoslash
import { useState } from "react";

// message is string | undefined
const [message, setMessage] = useState<string>();
```

## Why This Matters

The term "generic" has become far too overloaded. When we mix up type arguments and parameters with generic functions and types, it's hard to understand what's going on.

For me, learning generics really clicked when I understood that these concepts are separate:

| Concept          | Example                                            |
| ---------------- | -------------------------------------------------- |
| Generic Type     | `type MyType<T> = T`                               |
| Generic Function | `const myFunc = <T>() => {}`                       |
| Type Parameter   | `T` in `MyType<T>` or `myFunc<T>`                  |
| Type Argument    | `string` in `MyType<string>` or `myFunc<string>()` |

In this course, I'll be taking you through each of these ideas in turn. We'll start with how to use generic types to DRY up your type code. Then, we'll head to generic functions and classes.

By the end of this course, I guarantee you'll understand generics at a much deeper level. You'll know when to use them, and what to use them for.

Want to get the next lesson now? Click the link below.

# ARTICLE: Turning types into type functions 🤯

In our first lesson, we talked about the main thing people feel confused about when it comes to generics: the term 'generic' itself.

We're going to start our journey by looking at generic types. I think they're the easiest to pick up and start using.

You'll learn how generic types can reduce repetition in your types, just like functions reduce repetition in your runtime code. And if you've never used them before, you'll soon wonder how you ever lived without them.

## The Problem Generic Types Solve

```ts twoslash
type User = {
  id: string;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  phone: string | null | undefined;
};
```

```ts twoslash
type Maybe = null | undefined;

type User = {
  id: string;
  firstName: string | Maybe;
  lastName: string | Maybe;
  phone: string | Maybe;
};
```

But this feels a bit strange. `firstName` isn't 'string or maybe', it's 'maybe a string'. 'Maybe' isn't separate from `string`, it's a descriptor of `string`.

The right API would feel something like this:

```ts twoslash
type User = {
  id: string;
  firstName: Maybe<string>;
  lastName: Maybe<string>;
  phone: Maybe<string>;
};
```

Now, we're applying `Maybe` to `string`. It's as if `Maybe` is a function, and we're passing an argument to it.

But how do we make this API work?

## Our First Generic Type

We can turn `Maybe` into a generic type by adding a type parameter:

```ts twoslash
type Maybe<T> = null | undefined;
//         ^ Type Parameter
```

We place it just after the type's name, inside angle brackets. We can call it whatever we want, but `T` is a common choice.

We've turned our `Maybe` type from a _variable_ into a _function_. We can think of everything after the `=` as what our function returns.

Currently, we're not using `T` in the returned type. Whatever we pass in to `Maybe`, we'll always get back `null | undefined`.

Let's game this out for a second. If we pass in `string` to `Maybe`, we should get back `string | null | undefined`.

```ts twoslash
type MaybeString = Maybe<string>; // string | null | undefined
```

So whatever we pass in needs to be used in a union with `null | undefined`. We can do this by adding `T` to the returned type:

```ts twoslash
type Maybe<T> = T | null | undefined;
```

Now, whatever we put into `Maybe`, we get back that type or `null` or `undefined`:

```ts twoslash
type MaybeString = Maybe<string>; // string | null | undefined
type MaybeNumber = Maybe<number>; // number | null | undefined
type MaybeBoolean = Maybe<boolean>; // boolean | null | undefined
```

This is great, because we've saved ourselves a lot of keystrokes - and we've also got a single source of truth for our `Maybe` type.

## Anatomy Of A Generic Type

Let's break down the anatomy of a generic type, and how it differs from a normal type.

```ts twoslash
// Generic Type
type Maybe<T> = T | null | undefined;

// Type
type Maybe = null | undefined;
```

Syntactically, they really are extremely similar. The only difference is the type parameter `T` in the generic type.

But as a mental model, they're quite different. The difference is like the difference between a function and a variable:

```ts twoslash
// Function
const add = (a, b) => {
  return a + b;
};

// Variable
const add = 5;
```

The variable is static - it's always 5. The function is dynamic - it can return different values based on its arguments.

And in order to produce the returned value, you have to _call_ the function with an argument.

In the same way, to produce a type from a generic type, you have to _call_ it with a type argument.

Instead of `add(5, 10)`, you have `Maybe<string>`.

- Compare to a normal type
- Define terms for type parameters, returned type

## One More Example

- DataShape example from the book

# ARTICLE: Going deep on generic types: constraints and defaults

Generic Result<T, TError> type
Default TError to Error, constrain it to me { message: string }
Refactoring repeated types to use generic types

# ARTICLE: Generic functions are everywhere

Understand how to pass type arguments to generic functions
document.getElementById
Set(), Map()
JSON.parse is not generic, fetch is not generic

# ARTICLE: The “Hello World” of generic functions

Creating functions that receive type arguments
createSet
getElement

# VIDEO: Generic Functions vs Generic Types

Generic Functions can be constrained and defaulted
createSet
With generic types, you MUST pass all type arguments
With generic functions, you can omit all the type arguments
If you do, they default to their defaults, constraint, or unknown if unconstrained
Why is this behavior allowed? We’ll look at that next time.

# ARTICLE: The secret sauce of generics: inference

If a type argument is not provided to a function, it’ll be inferred from the arguments
uniqueArray
retryPromise
If you do pass a type argument, the type argument becomes the source of truth

# ARTICLE: It’s not just functions and types that can be generic…

Generic classes
MapOfArrays<T>

# VIDEO: How do you know when a function should be generic?

Look at a repeated function, draw out the functionality/data that is bespoke per function.
Does the return type of the function depend on the type of the argument?
uniqueArray
If not, does a type in the argument rely on another argument?
modifyArrayMember

# COURSE PREVIEW: Generic React Components

Not interested? Click this link and we’ll skip over this lesson (segments based on React interest)
Table component

# ARTICLE: Don’t let your generic functions lie to you

Re-examine document.getElementById and notice that it’s a hidden assertion

# VIDEO: Generic functions run the world

A brief look at Zod’s generic functions
Combining type transformations with generic functions
toCamelCase
