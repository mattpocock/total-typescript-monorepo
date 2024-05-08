---
title: Wrapping a Generic Function Inside of Another
description: Learn how TypeScript behaves when wrapping one generic function inside of another generic function.
---

Here we have a function called `useStateAsObject`. The function is a simple wrapper for `useState`, but instead of returning a tuple, we're opting to return an object:

```typescript
export const useStateAsObject =  (initial: any) => {
  const [value, set] = useState(initial);

  return {
    value,
    set
  };
};
```

As seen in the tests, when using the function we expect the `value` to be typed as `string` and the `set` to be typed as `React.Dispatch<React.SetStateAction<{ name: string }>>`. However, the `value` is being inferred as `any`:

```typescript
const example = useStateAsObject({ name: "Matt" });

// hovering over useStateAsObject
const useStateAsObject: (initial: any) => {
  value: any;
  set: React.Dispatch<any>;
}
```

## Challenge

Your task is to figure out a way to make this function actually work.

Notice that when calling `useStateAsObject` we aren't passing any type arguments. It looks like we're expecting it to "just work" by passing it `{ name: string }` as the initial value.

Use some of the syntax that we've seen so far to turn `useStateAsObject` into a generic function.

There are multiple solutions to this, but they all involve instantiating a generic in some form.