---
title: Implement a Generic Type Helper
description: A generic type helper makes our code more reusable and easier to understand.
---


## Creating a Type Helper

Let's start by declaring a type `LooseAutoComplete`, which accepts a type variable `T`.

```typescript
type LooseAutoComplete<T> = ...
```

The `<T>` indicates that `LooseAutoComplete` takes an argument of type `T`, kind of like a function.

For example, if we set `LooseAutoComplete` to the string "hello", then it will act like a function that takes in an input `T` and returns the string "hello".

```typescript
type LooseAutoComplete<T> = 'hello';

const looseAutoComplete = (t: any) => {
  return "hello";
}
```

In the above code, `LooseAutoComplete` is defined as a JavaScript function that takes in an input `T` (which we'll consider as `any` type for now), and returns the string 'hello'. 

But what happens when we try to use `LooseAutoComplete` without passing any type arguments? 

```typescript
type Example = LooseAutoComplete; // Error!
```

The above example will result in an error because `LooseAutoComplete` requires a type argument. That's why the term 'generic type' is used here.

In TypeScript, a generic type is a way of creating reusable components that can work over several types rather than a single one.

We can pass a type argument to `LooseAutoComplete` using the following syntax:

```typescript
type Example = LooseAutoComplete<123>;
```

In this case, `Example` will be 'hello', because that's what we're returning from the `LooseAutoComplete` type function. 

# Capturing Logic in our Loose Autocomplete Helper

In order to capture logic inside of our `LooseAutoComplete` helper, we can update it to take in a type `T` and return the type `T`. Since we want to use `Icon`, we'll then update the `Example` to pass in an argument `Icon`.

```typescript
type LooseAutoComplete<T> = T;
type Example = LooseAutoComplete<Icon>;
```
Since the `Icon` type is `home`, `settings`, or `about`, when we hover over `Example` we can see that its type is a union of the `Icon` types.

We can extend the `LooseAutoComplete` type to include the `(string & {})` from the `LooseIcon` we started with.

Then we can update `LooseIcon` to be `LooseAutoComplete<Icon>`, and `LooseButtonVariant` to be `LooseAutoComplete<ButtonVariant>`

```typescript
type LooseIcon = LooseAutoComplete<Icon>;
type LooseButtonVariant = LooseAutoComplete<ButtonVariant>;
type LooseAutoComplete<T> = T | (string & {});
```

The pattern we've followed here is not just useful for capturing different types in different type functions, but it also offers a way to describe complicated setups while being much more readable that what we started with.