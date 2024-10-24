# Const type parameters brings 'as const' to functions

TypeScript 5.0 introduced a brand-new piece of syntax to the language: `const` type parameters.

```typescript
const myFunc = <const T>(input: T) => {
  return input;
};
```

To understand why it's useful, let's first take a look at a function that _doesn't_ use a `const` type parameter:

```typescript
const myFunc = <T>(input: T) => {
  return input;
};
```

Let's say you call `myFunc` using an object:

```typescript
const result = myFunc({ foo: "bar" });
```

The type of `result` will be `{ foo: string }`. This is exactly the same as if you'd declared your object as a variable:

```typescript
const myObj = { foo: "bar" }; // { foo: string }
```

If you hover over `myObj` in VS Code, you'll see that the type is the same as above - `{ foo: string }`.

But what if we don't want to infer a `string`, but instead the literal `bar`?

On the variable, we can use `as const` to do this:

```typescript
const myObj = { foo: "bar" } as const; // { readonly foo: "bar" }
```

But how do we handle it on the function? Enter the `const` type parameter:

```typescript
const myFunc = <const T>(input: T) => {
  return input;
};

const result = myFunc({ foo: "bar" }); // { readonly foo: "bar" }
```

This is a really useful way of preserving the literal types of objects passed to your functions.

How are you planning on using const type parameters? Let me know on my [Discord Server](https://mattpocock.com/discord).
