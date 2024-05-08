---
title: Adding Type Arguments to a Function
description: By default, type arguments are inferred as `unknown`. When using this type of API in your code, it is crucial to have it well-documented.
---

Here's the starting point for the `useLocalStorage` function and how we're currently calling it:

```typescript
export const useLocalStorage = (prefix: string) => {
  return {
    get: (key: string) => {
      return JSON.parse(window.localStorage.getItem(prefix + key) || "null");
    },
    set: (key: string, value: any) => {
      window.localStorage.setItem(prefix + key, JSON.stringify(value));
    },
  };
};

// error on `{ name: string }`
const user = useLocalStorage<{ name: string }>("user");
```

We can see that the function takes a runtime argument, `prefix: string`.

When calling it, we are passing not only the runtime argument, but also a type argument as evidenced by the angle brackets `<>`.

In other words, we are passing a type argument into a function that currently isn't set up to accept one.

## Adding a Type Argument to a Function

To add support for a type argument, we can add a `T` to our function. This will also fix the error pointed out above:

```typescript
export const useLocalStorage = <T>(prefix: string) => { ...
```

Now when we hover over the call to `useLocalStorage` we can see that it's expecting a type argument:

```typescript
// hovering over `useLocalStorage`

const useLocalStorage: <{
  name: string;
}>(prefix: string) => {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
}
```

However, we also see several `any`s that should be typed as `T`.

## Fixing the `get` and `set` Types

The `get` and `set` inside of `useLocalStorage` are currently typed as `any`:

```typescript
get: (key: string) => {
  return JSON.parse(window.localStorage.getItem(prefix + key) || "null");
},
set: (key: string, value: any) => {
  window.localStorage.setItem(prefix + key, JSON.stringify(value));
}
```

It might look like the `get` function should be typed as `T`, but that's not quite right because we can see from the return that the type will either be a string parsed from JSON or `null`.

This means the type should be `T | null`:

```typescript
get: (key: string): T | null => { ...
```

The `set` function's `any` type in the `value` should be updated to match the `T` that is passed in:

```typescript
set: (key: string, value: T) => { ...
```

## Type Arguments are Inferred as `unknown`

If we hover over `useLocalStorage` again, we can see that the type argument is being inferred as `unknown`:

```typescript
// hovering over `useLocalStorage`

const useLocalStorage: <unknown>(prefix: string) => {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
}
```

Down in the tests we also still have an error when checking the type of `mattUser`:

```typescript
const user = useLocalStorage("user")
const mattUser = user.get("matt");

// error!
type tests = [Expect<Equal<typeof mattUser, { name: string } | null>>];
```

The reason we have this error is because the `user` isn't using the type argument, so it's being inferred as `unknown`.

The fix is to specify it:

```typescript
const user = useLocalStorage<{ name: string }>("user")
```

When you have this type of API where you require people to pass the type arguments in, it's crucial to have it well-documented and ensure that they continue to do so.