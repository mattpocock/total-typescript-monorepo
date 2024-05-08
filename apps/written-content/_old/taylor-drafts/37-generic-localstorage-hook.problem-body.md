---
title: Adding Type Arguments to a Hook 
description: Type arguments allow us to pass in a type to a hook, which can be used to provide more accurate return values.
---

Consider this `useLocalStorage` function:

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
```

The `useLocalStorage` function is like a namespace for all `localStorage` entries. It takes a prefix as an argument, which is used to group related entries under this prefix. 

For example, we can use `useLocalStorage` to store users and their names:

```typescript
const user = useLocalStorage<{name: string}>("user");
```
As seen in the tests, the function should allow us to get and set values:

```typescript
user.set("matt", {name: "Matt"});

const mattUser = user.get("matt");
```

However, we currently have an error because the user returned by this function is of type `any`.

When we call `user`, we expect the result to be either a string representing the name, or `null`. This is because when we get an item from `localStorage`, it might not exist, in which case, `localStorage` returns `null`. 

It's also important to note that the function should not allow setting a value that is different from the type argument passed in. 
This is where we encounter an issue. When we try to pass a type into `useLocalStorage` (similar to what we did with `useState` in previous modules), we get an error - "expected zero type arguments but got one."

We have another issue where the function is allowing us to set values that are different from the type argument passed in. We shouldn't be able to do this, as seen in the tests:

```typescript
// inside the tests

user.set(
  "something",
  // @ts-expect-error
  {},
);
```

## Challenge

Your task is to find a way to turn `useLocalStorage` into a generic function takes in a type argument. The `get` and `set` types should not return `any`, or allow for `any` to be passed in.