# Get Keys of an Object Where Values Are of a Given Type

A common problem in TypeScript is when you want to get the keys of an object where the values are of a given type. For example, let's say you have an object like this:

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};
```

And we want to only retrieve the keys where the value is a `string`. So we want to get `"a" | "b"`.

This is deceptively tricky - but let's try it out.

## Quick Solution

This technique uses key remapping to extract only the string keys:

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};

// ---cut---

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type StringKeysOfObj = StringKeys<Obj>;
//   ^?
```

You can make it reusable by providing a generic condition:

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};

// ---cut---

type KeysOfValue<T, TCondition> = {
  [K in keyof T]: T[K] extends TCondition ? K : never;
}[keyof T];

type StringKeysOfObj = KeysOfValue<Obj, string>;
//   ^?
```

## Explanation

Let's look at how I reached this solution, and I'll try to walk you through my thought process.

Generic types like these are easier to understand if you think of them as having a beginning, middle, and end.

In the beginning, we start off with a plain object.

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};
```

We know we're heading towards a union of keys, so we know `keyof` will be involved somewhere:

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};

// ---cut---

type KeysOfObj = keyof Obj;
//   ^?
```

You might think - great! We're halfway there. All we'd need now is to exclude the keys that don't have a string value, maybe using the `Exclude` type helper:

```ts
type StringKeys = Exclude<
  KeysOfObj,
  // What do we put here?
  ???
>;
```

The issue becomes apparent when we try to fill in the second type argument to `Exclude`. We need the context of the _current_ key to determine whether `Obj[Key]` is a string or not.

So the 'middle' of our type is going to be about _iterating over each key_. The whole story is clear - let's implement it.

### Iterating over each key

There are several different ways of achieving this. My favorite is by using an [IIMT - an immediately indexed mapped type](/immediately-indexed-mapped-type).

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};

// ---cut---

type KeysOfObj = {
  // ^?
  [K in keyof Obj]: `hello_${K}`;
}[keyof Obj];
```

This lets us create an object using a mapped type, then index into it using `keyof Obj` to output the value of the object we create.

The benefit of this is that we get access to the current key AND the object in the same scope, so we can use the current key to index into the object.

In this case, we're using it to create a string literal type that prefixes each key with `hello_`.

But what if we want to do something different depending on the type of the value?

### Conditional types

We can use a conditional type to do this. Conditional types let you express if/else logic with conditionals:

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};

// ---cut---

type Tests = [
  // ^?
  Obj["a"] extends string ? true : false,
  Obj["b"] extends string ? true : false,
  Obj["c"] extends string ? true : false,
  Obj["d"] extends string ? true : false
];
```

In this case, we'll let us check if the value of the current key is a string or not. If it isn't, we'll return `never`, not `false`.

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};

// ---cut---

type KeysOfObj = {
  // ^?
  [K in keyof Obj]: Obj[K] extends string ? K : never;
}[keyof Obj];
```

You'll notice that technically, `KeysOfObj` should be of type `'a' | 'b' | never | never`:

```ts twoslash
type Obj = {
  a: string;
  b: string;
  c: number;
  d: number;
};

// ---cut---

type Tests = [
  // ^?
  Obj["a"] extends string ? "a" : never,
  Obj["b"] extends string ? "b" : never,
  Obj["c"] extends string ? "c" : never,
  Obj["d"] extends string ? "d" : never
];
```

But TypeScript will automatically remove `never` from unions, so we end up with `'a' | 'b'`.

```ts twoslash
type Example = "a" | "b" | never | never;
//   ^?
```

### Making it generic

The final part of the challenge is to turn this into a type helper we can use with any object. We can do that by adding a type argument to `StringKeys` and removing the hard-coded references to `Obj`:

```ts twoslash
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type User = {
  firstName: string;
  lastName: string;
  age: number;
  numberOfCats: number;
};

type StringKeysOfObj = StringKeys<User>;
//   ^?
```

To make it even more reusable, we can add a second type argument to our helper to let us specify the condition:

```ts twoslash
type User = {
  firstName: string;
  lastName: string;
  age: number;
  numberOfCats: number;
};

// ---cut---
type KeysOfValue<T, TCondition> = {
  // ^?
  [K in keyof T]: T[K] extends TCondition ? K : never;
}[keyof T];

type StringKeysOfObj = KeysOfValue<User, string>;
//   ^?

type NumericKeysOfObj = KeysOfValue<User, number>;
//   ^?
```

So there we have it - we've figured out our type helper. We take in an object, run it through an IIMT to iterate over its keys, and use a conditional type to check if the value of the current key matches the condition.
