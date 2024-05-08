If you don't understand generics in TypeScript, I think there's something you've misunderstood.

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
  // implementation...
};

myFunc<string>();

class MyClass<T> {
  // implementation...
}

new MyClass<string>();
```

This can be used in all sorts of ways. By far the most popular is to provide type information to third-party libraries. In the example below, how would `useState` know what type it's supposed to be returning?

```ts twoslash
import { useState } from "react";

const [message, setMessage] = useState();
//     ^?
```

It can't - so we have to pass a type argument to it.

```ts twoslash
import { useState } from "react";

const [message, setMessage] = useState<string>();
//     ^?
```

## Inferring Type Arguments

You'll notice, though, that generic functions and generic classes act _differently_ from types. They don't require you to pass a type argument.

```ts twoslash
const myFunc = <T>() => {
  // implementation...
};
class MyClass<T> {
  // implementation...
}

// ---cut---

// No error!
myFunc();

new MyClass();
```

But generic types _do_ require you to pass one.

```ts twoslash
// @errors: 2314
type Maybe<T> = T | null | undefined;

// ---cut---

type Example = Maybe;
```

Why is this? Well, if you don't pass a type argument to a generic function or generic class, it'll attempt to **infer it from the runtime arguments**.

This is how `useState` works under the hood. Its declaration looks something like this (simplified):

```ts twoslash
declare function useState<T>(
  initial?: T
): [T, (newValue: T) => void];
```

You can see that it accepts `T` as a type parameter and returns a tuple containing `T` and a function to update it.

If we pass a runtime argument to it, TypeScript can infer the type argument from that:

```ts twoslash
declare function useState<T>(
  initial?: T
): [T, (newValue: T) => void];

// ---cut---

// T is inferred as string!
const [message, setMessage] = useState("Hello!");
//     ^?

// T is inferred as number!
const [id, setId] = useState(1);
//     ^?
```

Now that we're passing a runtime argument, TypeScript can infer the type argument from it.

## 'Generic' is an adjective

Remove the noun 'generic' from your vocabulary. Replace it with 'type argument' and 'type parameter'. Use it as an adjective only.

I'll give you one concession - the plural, 'generics'. It's too widely ingrained to be gotten rid of.

Let's keep it - but let's consider it a useful shorthand for 'generic types', 'generic functions', and 'generic classes'.
