---
title: Type Inference with Generic Functions in TypeScript
description: TypeScript uses type inference to infer the type of generic functions, making them easier to use.
---


## The Simplest Solution

Let's start with the simplest solution, which might blow your mind as to how easy it is.

Similar to what we've seen before, we can add a type argument of `T` to the `useStateAsObject` function:

```typescript
export const useStateAsObject = <T>(initial: T) => { ...
```

With just this implementation, our tests work perfectly.

Hovering over the `example`, you'll notice that our `T` is appropriately typed with `value` as `name: string` and `set` is typed as `React.Dispatch` with that same `T`:

```typescript
const example = useStateAsObject({ name: "Matt" });

// hovering over example
const example: {
  value: {
    name: string;
  };
  set: React.Dispatch<React.SetStateAction<{
    name: string;
  }>>;
}
```

This showcases how clever TypeScript can be, but let's dive a little deeper.

## A Deeper Dive into Type Inference

TypeScript has a feature where if you pass a runtime argument into a slot where a type argument is expected, it will try to infer the type argument from the runtime arguments.

In our example, when we pass in `{ name: "Matt" }` when creating our example, it is inferred into the type argument of `T`.

If we were to pass in another random key with a type of number, that change would be reflected as well: 

```typescript
const example = useStateAsObject({ name: "Matt", awdjkhawbd: 123 });

// hovering over example
const example: {
  value: {
    name: string;
    awdjkhawbd: number;
  };
  set: React.Dispatch<React.SetStateAction<{
    name: string;
    awdjkhawbd: number;
  }>>;
}
```

However, if we specify `name: string` when creating the example, it will take precedence over the runtime version and the key with the `number` will cause an error:

```typescript
// error on awdjkhawbd
const example = useStateAsObject<{ name: string}>({ name: "Matt", awdjkhawbd: 123 });
```

Remember, this only happens if you don't pass in any type arguments!

# Why it Works

This solution works because the declaration of `useStateAsObject` specifies `initial` as `T`, which is then passed into `useState`. Since `useState` is a generic function itself, TypeScript infers all of the stuff it needs to do from there.

```typescript
export const useStateAsObject = <T>(initial: T) => {
  const [value, set] = useState(initial);
  ...

// hovering over `useState`
useState: <T>(initialState: T | (() => T)) => [T, React.Dispatch<React.SetStateAction<T>>];

// hovering over `set`
const set: React.Dispatch<React.SetStateAction<T>>;
```

This feature of TypeScript is incredibly powerful and shows how smart the language really is.

## Alternative Solutions

There are a few more ways we can approach this.

You may have noticed that in our initial example, we weren't annotating the return type- we're simply letting it pass through.

We could specify the return type manually, matching what we saw from the tests:

```typescript
export const useStateAsObject = <T>(initial: T): { value: T; set: React.Dispatch<React.SetStateAction<T>> } => {
  const [value, set] = useState(initial);
  ...
```

However, this isn't necessarily the best solution, as it can become quite verbose for something that can be as simple as the first solution.

Another solution would be to extract `UseStateAsObject` return into its own type helper:

```typescript
type UseStateAsObjectReturn<T> = {
  value: T;
  set: React.Dispatch<React.SetStateAction<T>>;
};

export const useStateAsObject = <T>(initial: T): UseStateAsObjectReturn<T> => {
  const [value, set] = useState(initial);
  ...
```

This solution would also work with an interface with no difference in behavior.

You may notice a pattern here where different type helpers pass their types into other type helpers.

One last possible solution would be to pass the generic parameter `T` into `useState` manually:

```typescript
// inside useStateAsObject
const [value, set] = useState<T>(initial);
```

However, this is more like a "double check" of the correctness of our code, rather than a necessity. 

## Wrapping Up

The first solution that we discussed seems to be the cleanest. It's got a minimal setup, and everything functions seamlessly.

Generics are awesome!