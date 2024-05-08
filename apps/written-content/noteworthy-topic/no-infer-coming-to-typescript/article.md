TypeScript 5.4 brought a new utility type called `NoInfer`. Let's see how it can be used to improve TypeScript's inference behavior in certain situations.

## What is `NoInfer`?

`NoInfer` is a utility type that can be used to prevent TypeScript from inferring a type from inside a generic function.

We'll look at _why_ you'd want to do this in a moment. But first, let's see it at work.

Imagine we have a generic function that just returns the type of the value passed in:

```ts twoslash
const returnWhatIPassedIn = <T>(value: T) => value;

const result = returnWhatIPassedIn("hello");
//    ^?
```

In this case, TypeScript infers the type of `result` to be `"hello"`.

But what if we were to wrap `value: T` with `NoInfer`?

```ts twoslash
type NoInfer<T> = [T][T extends any ? 0 : never];

// ---cut---

const returnWhatIPassedIn = <T>(value: NoInfer<T>) => value;

const result = returnWhatIPassedIn("hello");
//    ^?
```

`NoInfer` has prevented `value` from being a valid source of inference for `T`. So now, `result` is inferred as `unknown`. We'd need to explicitly provide the type to `returnWhatIPassedIn` to get the desired return type:

```ts twoslash
type NoInfer<T> = [T][T extends any ? 0 : never];

const returnWhatIPassedIn = <T>(value: NoInfer<T>) => value;

// ---cut---

const result = returnWhatIPassedIn<"hello">("hello");
//    ^?
```

So, why would you want to do this?

## The Problem `NoInfer` Solves

Let's imagine that you have a function that has multiple candidates for inferring a type parameter.

A great example is a function that creates a finite state machine (FSM). The FSM has an `initial` state and a list of `states`. The `initial` state must be one of the `states`.

Let's use `declare` to define the function signature (so I don't have to provide an implementation):

```ts twoslash
declare function createFSM<TState extends string>(config: {
  initial: TState;
  states: TState[];
}): TState;
```

Notice that there are two possible places where TypeScript could infer the type `TState` from: `initial` and `states`.

If we try to call it, TypeScript will infer `TState` from BOTH `initial` and `states`:

```ts twoslash
declare function createFSM<TState extends string>(config: {
  initial: TState;
  states: TState[];
}): TState;

// ---cut---

const example = createFSM({
  initial: "not-allowed",
  states: ["open", "closed"],
});

console.log(example);
//          ^?
```

But this is a problem! We want TypeScript to infer `TState` from `states` only. We don't want `initial` to be a candidate for inference. We want to ensure that `initial` is a valid state in the `states` array.

This is where `NoInfer` comes in.

## How `NoInfer` Helps

We can use `NoInfer` to prevent `initial` from being a candidate for inference:

```ts twoslash
type NoInfer<T> = [T][T extends any ? 0 : never];

// ---cut---

declare function createFSM<TState extends string>(config: {
  initial: NoInfer<TState>;
  states: TState[];
}): TState;
```

Now, when we call `createFSM`, TypeScript will infer `TState` from `states` only. This means that we correctly get an error from our `initial` property:

```ts twoslash
// @errors: 2322
type NoInfer<T> = [T][T extends any ? 0 : never];

declare function createFSM<TState extends string>(config: {
  initial: NoInfer<TState>;
  states: TState[];
}): TState;

// ---cut---

createFSM({
  initial: "not-allowed",
  states: ["open", "closed"],
});
```

If we swap `NoInfer` over to `states`, then the only valid `states` will be the value of `initial`:

```ts twoslash
// @errors: 2322
type NoInfer<T> = [T][T extends any ? 0 : never];

// ---cut---
declare function createFSM<TState extends string>(config: {
  initial: TState;
  states: NoInfer<TState>[];
}): TState;

createFSM({
  initial: "open",
  states: ["closed"],
});
```

So, we can use `NoInfer` to control where TypeScript infers a type from inside a generic function. This can be useful when you have multiple runtime parameters each referencing the same type parameter. `NoInfer` allows you to control which parameter TypeScript should infer the type from.
