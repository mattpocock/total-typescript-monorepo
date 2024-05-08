TypeScript 5.3 was released last week.

As usual, I scanned the [announcement post](https://devblogs.microsoft.com/typescript/announcing-typescript-5-3/), but I quickly noticed something interesting.

One of the most important changes in TypeScript 5.3 wasn't mentioned in the release notes.

## Quick Code Sample

```ts twoslash
// This would error in 5.2, but is allowed in 5.3!
const array = ["a", "b", "c"] as const satisfies string[];

const returnWhatIPassIn = <const T extends any[]>(t: T) => {
  return t;
};

// result is any[] in TS 5.2, but ['a', 'b', 'c'] in 5.3
const result = returnWhatIPassIn(["a", "b", "c"]);
```

## Full Explanation

Working with readonly arrays in TS can be occasionally a bit of a pain.

Let's say you want to declare an array of routes as const.

This allows you to reuse the paths declared for a type.

```ts twoslash
declare const Home: any;
declare const About: any;

// ---cut---

const arrayOfRoutes = [
  { path: "/home", component: Home },
  { path: "/about", component: About },
] as const;

type Route = (typeof arrayOfRoutes)[number]["path"];
//    ^?
```

But what if you want to make sure that the `arrayOfRoutes` conforms to a certain type?

For that, you can use satisfies.

```ts twoslash
import React from "react";
declare const Home: any;
declare const About: any;

// ---cut---

const arrayOfRoutes = [
  { path: "/home", component: Home },
  { path: "/about", component: About },
] as const satisfies {
  path: string;
  component: React.FC;
}[];
// Type is 'readonly' and cannot be
// assigned to a mutable type
```

The only trouble is that in TypeScript 5.2, this would give an error! But... Why?

### Readonly Arrays vs Mutable Arrays

Well, it's because `arrayOfRoutes` is readonly, and you can't satisfy a mutable array with a readonly one.

So, the fix was to make the type we were satisfying a `readonly` array:

```ts twoslash
import React from "react";
declare const Home: any;
declare const About: any;

// ---cut---

const arrayOfRoutes = [
  { path: "/home", component: Home },
  { path: "/about", component: About },
] as const satisfies readonly {
  path: string;
  component: React.FC;
}[];

// No more error!
```

Now that we're using a readonly array, TypeScript is happy.

### Const Type Parameters

The same was true when using const type parameters, but even more pernicious.

In this position, `const` infers the thing passed into `T` as if it were `as const`.

But if you try to constrain it with an array, it doesn't work!

```ts twoslash
const returnWhatIPassIn = <const T extends any[]>(t: T) => {
  return t;
};

// result is any[] in TS 5.2!
const result = returnWhatIPassIn(["a", "b", "c"]);
```

Before TS 5.3, the fix was to add `readonly` to the type parameter:

```ts twoslash
const returnWhatIPassIn = <const T extends readonly any[]>(
  t: T
) => {
  return t;
};

// result is ['a', 'b', 'c']!
const result = returnWhatIPassIn(["a", "b", "c"]);
```

But this fix was hard to find and required some deep knowledge of how const type parameters worked.

### How TypeScript 5.3 Fixed It

Since 5.3, TypeScript has relaxed the rules around readonly arrays.

In these two situations, TypeScript now acts more helpfully.

The `satisfies` keyword now lets you pass in readonly arrays:

```ts twoslash
// This would error in 5.2, but is allowed in 5.3!
const array = ["a", "b", "c"] as const satisfies string[];
//    ^?
```

Const type parameters now infer the type passed in instead of defaulting to their constraints:

```ts twoslash
const returnWhatIPassIn = <const T extends any[]>(t: T) => {
  return t;
};

// result is any[] in TS 5.2, but ['a', 'b', 'c'] in 5.3
const result = returnWhatIPassIn(["a", "b", "c"]);
//    ^?
```

Note that there is a small difference! If you were to specify `readonly string[]` instead of `string[]`, you would get a readonly array back.

So you still need to specify readonly if you want a readonly array back.

```ts twoslash
// This would error in 5.2, but is allowed in 5.3!
const array = [
  //  ^?
  "a",
  "b",
  "c",
] as const satisfies readonly string[];

const returnWhatIPassIn = <const T extends readonly any[]>(
  t: T
) => {
  return t;
};

// result is any[] in TS 5.2, but ['a', 'b', 'c'] in 5.3
const result = returnWhatIPassIn(["a", "b", "c"]);
//    ^?
```

But this is a massive improvement, making both `const` type parameters and `satisfies` much easier to work with.

TypeScript - you gotta shout about these things! I'll be updating my course with this new behavior very soon.
