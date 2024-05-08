# Type Predicate Inference: The TS 5.5 Feature No One Expected

TypeScript 5.5 will be dropping in the next couple of months. And thanks to one PR in particular, I already know it's going to be an incredible release.

On Friday night, TypeScript merged [Dan Vanderkam's PR](https://github.com/microsoft/TypeScript/pull/57465) to "Infer type predicates from function bodies using control flow analysis". Let's explain exactly what that PR changed, and why it's such a big deal.

## The Problem

Let's say you want to check if a value is a string or a number. This is pretty simple - you can use an `if` statement:

```ts twoslash
declare const value: string | number;

// ---cut---

console.log(value);
//          ^?

if (typeof value === "string") {
  console.log(value);
  //          ^?
}
```

Now, inside the `if` statement, TypeScript knows that `value` is a string. This is called "narrowing" - TypeScript has narrowed the type of `value` from `string | number` to just `string`.

But what if you want to write a function that does this? You might write something like this:

```ts twoslash
function isString(value: unknown) {
  return typeof value === "string";
}
```

Then, you'd apply the function to `value` - but something's not quite right:

```ts
if (isString(value)) {
  console.log(value); // string | number
}
```

We've lost our narrowing! TypeScript doesn't know that `isString` is a type predicate - a function that narrows the type of its argument.

We can fix this by adding a return type annotation to `isString`:

```ts twoslash
declare const value: string | number;

// ---cut---

function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(value)) {
  console.log(value);
  //          ^?
}
```

Now, we have our narrowing back. We can even use this function in a `filter` call:

```ts twoslash
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// ---cut---

const arr = [1, "hello", 3, "world"];

const strings = arr.filter(isString);
//    ^?
```

But this is a bit of a pain. Even worse than that, the return type annotation can get out of sync with the implementation of the function. We can change the return type to `value is number` and TypeScript won't complain:

```ts twoslash
declare const value: string | number;

// ---cut---

function isString(value: unknown): value is number {
  return typeof value === "string";
}

if (isString(value)) {
  console.log(value);
  //          ^?
}
```

This makes this annotation quite brittle.

Wouldn't it be great if `value is string` could be inferred from the function body? That way, it would stay in sync with the implementation of the function, and we wouldn't have to write it out ourselves.

## The Solution

That's exactly what Dan's PR does. With TypeScript 5.5, you can write an `isString` function, and it'll infer the type predicate from the function body:

```ts
function isString(value: unknown) {
  return typeof value === "string";
}

if (isString(value)) {
  console.log(value); // string
}
```

This uses TypeScript's control flow analysis to infer the type predicate from the function body. This is the same analysis that's used to narrow types inside `if` statements.

This means that you can do complex type narrowing without having to write out the type predicate yourself.

```ts
function isObjAndHasIdProperty(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number"
  );
}

if (isObjAndHasIdProperty(value)) {
  console.log(value.id); // number
}
```

This is a huge win for TypeScript. It fixes a long-running issue with TypeScript's inference. It makes capturing narrowing logic in functions much easier. And it makes TypeScript's type system more powerful.

Honestly, I can't believe they shipped it. It's a huge change to how TypeScript works, and it's going to make a lot of people's development lives easier.

## Will `filter(Boolean)` Work?

One question I got when I tweeted about this was whether `filter(Boolean)` would automatically infer.

I'll need to test it out when a beta is released, but on balance I think not. `Boolean` is not, by itself, a type predicate. For instance, if you try to use it in an `if` statement to remove a `null` from a union, TypeScript won't infer the type:

```ts twoslash
declare const value: string | null;

// ---cut---

if (Boolean(value)) {
  console.log(value);
  //          ^?
}
```

So, it also won't work with `.filter`. This means that you'll still need to use my library [`ts-reset`](/ts-reset) to get the correct inference:

```ts
import "@total-typescript/ts-reset";

const arr = [null, "hello", null, "world"];

const strings = arr.filter(Boolean); // string[]
```
