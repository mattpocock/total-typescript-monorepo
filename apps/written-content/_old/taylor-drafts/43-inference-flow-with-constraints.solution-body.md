---
title: Refactoring a Generic Hook for Best Inference
description: Comparing function arguments rather than the functions themselves should be considered a best practice when dealing with function assignability in TypeScript. 
---

We know that `useMutation` needs to capture something specific in its type arguments.

What we're interested in is the `createUser` type, which has a lot we want to capture that we can see when hovering over it:

```typescript
// hovering over createUser
const createUser: (user: {
  name: string;
  email: string;
}, opts?: {
  throwOnError?: boolean;
}) => Promise<{
  id: string;
  name: string;
  email: string;
}>
```

## Adding a `TMutation` Type Argument to `useMutation`

Let's try adding a `TMutation` type argument to `useMutation` and passing it into `tMutationOptions`:

```typescript
export const useMutation = <TMutation>(opts: UseMutationOptions<TMutation>): UseMutationReturn => {
  ...
```

We'll also rename the `Mutation` type to `MutationBase` to avoid conflicts with `TMutation`:

```typescript
type MutationBase = (...args: any[]) => Promise<any>;
```

Now we're getting an error because `UseMutationOptions` is not generic, so let's add a type argument to it and update it to use `MutationBase`:

```typescript
interface UseMutationOptions<TMutation> {
  mutation: TMutation;
}
```

With  these updates, our `TMutation` is now being used as the type argument for `TMutationOptions`, and if we hover over `useMutation`, we can see that we're capturing the entire function including all of its arguments and all of its return values.

```typescript
// hovering over useMutation
const useMutation: <(user: {
  name: string;
  email: string;
}, opts?: {
  throwOnError?: boolean | undefined;
} | undefined) => Promise<{
  id: string;
  name: string;
  email: string;
}>>...
```

This is good, but we've now got an error saying that `opts.mutation` isn't callable.

## Making `opts.mutation` Callable

Hovering over the error, we can see that `opts.mutation` is of type `unknown` and has no call signatures.

If you don't constrain a type argument, it's going to behave as if it were `unknown`, and we can't call `unknown` because we don't know if it's a function.

In order to get around this, we need to update `useMutation` to constrain `TMutation` with `MutationBase`:

```typescript
export const useMutation = <TMutation extends MutationBase>(opts: UseMutationOptions<TMutation>): UseMutationReturn => {
  ...
```

With this change, the `opts.mutation` error goes away. We've successfully captured the entire function in our type argument.

As a rule of thumb, when working with a type argument that's going to be passed around a lot, it's a good practice to define all the constraints upfront. This ensures that we're capturing the right argument and assigning it to the right area.

While we're at it, we also need to update `UseMutationOptions` to extend `MutationBase`:

```typescript
interface UseMutationOptions<TMutation extends MutationBase> {
  mutation: TMutation;
}
```

Even after doing this, we still have errors.

## Ensure the Returned Object is the Same Being Inferred

Hovering over the call to `mutation.mutate`, we can see that the `useMutationReturn` is still typed as `any`:

```typescript
// hovering over mutation.mutate
UseMutationReturn.mutate: (...args: any[]) => Promise<any>
```

To fix this we need to pass `TMutation` into `useMutationReturn`.

This requires `UseMutationReturn` to be made generic, with `TMutation` extending `MutationBase`.

```typescript
interface UseMutationReturn<TMutation extends MutationBase> {
  ...
```

By doing this, everything seems to work correctly and this error goes away.

However, a new error emerges that reveals a flaw in our approach.

## The Flaw in Our Approach

The error is on the `mutate` inside of the `useMutation` return:

```typescript
// inside useMutation
return {
  mutate: async (...args) => { // error on mutate!
    ...
```

The errors message reads:

```
Type '(...args: any[]) => Promise<any>' is not assignable to type 'TMutation'.
  'TMutation' could be instantiated with an arbitrary type which could be unrelated to '(...args: any[]) => Promise<any>'.
```

This issue arises because of the `UseMutationReturn`.

Here's what the interface currently looks like:

```typescript
interface UseMutationReturn<TMutation extends MutationBase> {
  mutate: TMutation;
  isLoading: boolean;
}
```

Essentially what this says is that the mutation that comes back is exactly the same type as the mutation we get from the thing we pass in. A `TMutation` comes in as a type argument, and `mutate` is typed as `TMutation` there.

Functions in TypeScript can be quite complicated, especially due to the concept of function overloads. You can have functions with multuple overloads that all have different levels of complexity, or you could have a simple function with only one overload.

Because of this, TypeScript has a built-in system where it doesn't like comparing generic functions to normal functions.

This is exactly what's causing our current issue. 

We've made a mistake in capturing the entire function in the type argument.

Instead of capturing the entire function in the type argument, we need to grab just parts of the function.

In this case, we need `user` and `opts` from the parameters, as well as the thing that comes back from it. 

## Refactoring `TMutation` to `TArgs` and `TReturn`

It's time for some refactoring. 

We are going to remove the `TMutation`s in favor of two new types: `TArgs` and `TReturn`.

Replace the instances in `UseMutationOptions`, `UseMutationReturn`, and `useMutation`:


```typescript
interface UseMutationReturn<TArgs, TReturn> {
  mutate: TMutation;
  isLoading: boolean;
}

interface UseMutationOptions<TArgs, TReturn> {
  mutation: TMutation;
}

export const useMutation = <TArgs, TReturn>(
  opts: UseMutationOptions<TArgs, TReturn>
): UseMutationReturn<TArgs, TReturn> => {
  ...
```

Next we'll rename `MutationBase` back to `Mutation`, and replace the `TMutation` in `useMutation` with `TArgs` and `TReturn`.

We'll also add `TArgs` for the array of arguments, and `TReturn` for the return value:

```typescript
type Mutation<TArgs, TReturn> = (...args: TArgs extends any[]) => Promise<TReturn>;
```

We'll then make similar changes to the other `TArgs`:

```typescript
interface UseMutationReturn<TArgs extends any[], TReturn> {...}

interface UseMutationOptions<TArgs extends any[], TReturn> {...}

export const useMutation = <TArgs extends any[], TReturn>(
  ...
```

Now the errors have gone, and the `result` is being inferred correctly:

```typescript
// inside useMutation
const result = await opts.mutatation(...args);

// hovering shows
const result: Awaited<TReturn>
```

Everything is working now!

We've successfully managed to handle all of the types in our custom hook.

## Recapping Our Work

The `useMutation` hook has two type parameters we can see when hovering:

```typescript
// hovering over useMutation
const useMutation: <[user: {
  name: string;
  email: string;
}, opts?: {
  throwOnError?: boolean | undefined;
} | undefined], {
  id: string;
  name: string;
  email: string;
}>(opts: UseMutationOptions<[user: {
  name: string;
  email: string;
}, opts?: {
  throwOnError?: boolean | undefined;
} | undefined], {
  id: string;
  name: string;
  email: string;
}>) => UseMutationReturn<[user: {
  name: string;
  email: string;
}, opts?: {
  ...
```

It's a bit hard to read, but we can see that the first type parameter is what we're passing in, and the second is what we're getting back.

Using these type arguments avoids the issue of having to compare functions to functions.
Instead, we only need to compare `TArgs` to `TArgs` and `TReturn` to `TReturn`.

Consider this type of comparison to be a best practice when dealing with function assignability in TypeScript. 