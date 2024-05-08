## Quick Explanation

- The empty object type - `{}` - doesn't behave how you expect in TypeScript.

- Instead of representing an empty object, it represents any value except `null` and `undefined`.

- This is because TypeScript's type system is structural, not nominal. Everything except `null` and `undefined` is an object, so everything can be assigned to an empty object.

- If you want to represent an empty object, use `Record<string, never>` instead.

## Video Explanation

<MuxVideo playbackId="02zXSt01PqVVHya4X5F02Uq2LjB9aeDMTwfpErBf00y6M9A" />

## Transcript

### The Empty Object Type

The empty object type in TypeScript doesn't really behave as you expect. It doesn't represent "any object". Instead, it represents any value that isn't `null` or `undefined`.

```ts twoslash
// @errors: 2322
const example1: {} = "str";
const example2: {} = 123;
const example3: {} = true;
const example4: {} = {
  foo: "whatever",
};
```

Here, we are basically typing `example1` as an empty object, yet we can pass a string to it. We can pass a number to it. We can pass a boolean to it and any object to it.

The only things we can't pass to it are `null` or `undefined`:

```ts twoslash
// @errors: 2322
const example5: {} = null;
const example6: {} = undefined;
```

If you're using ESLint, you might even hit an error:

> Don't use `{}` as a type. `{}` actually means "any non-nullish value".

This article explains exactly why this is good advice.

### The `Object` Type

This also happens with the `Object` type, which I think is just an alias over the top of `{}`:

```ts twoslash
// @errors: 2322
const obj1: Object = "str";
const obj2: Object = null;
```

So this behaves in exactly the same way. So you shouldn't be using this `Object` type either.

### Representing an Empty Object

If you do want to represent a kind of empty object, then we can use this `Record<PropertyKey, never>`.

```ts twoslash
// @errors: 2322
type EmptyObj = Record<PropertyKey, never>;

const emptyObj1: EmptyObj = {};
const emptyObj2: EmptyObj = {
  foo: "whatever",
};
const emptyObj3: EmptyObj = "str";
const emptyObj4: EmptyObj = 123;
```

What this does is it means that you can pass an empty object. It's going to stop you from passing anything with a property on it. And it's also going to stop you from passing primitives, or null or undefined.

### Constraining Functions

The only time this might be useful is if you want a really wide constraint on a function. Let's say you want to make sure that the thing that you're passing that function isn't `null` or `undefined`:

```ts twoslash
const myFunc = (constraint: {}) => {};

myFunc("str");
myFunc(123);
myFunc(true);
```

But even then, you're not going to be able to access any properties on `constraint`:

```ts twoslash
// @errors: 2339
const myFunc = (constraint: {}) => {
  constraint.foo;
};
```

You'll hit this error:

> Property 'foo' does not exist on type '{}'.

This is happening because we're trying to access a property on an empty object. So it's not terribly useful.

### Generic Functions

The only possible place it could be useful - or at least the one I want to cover here - is as a constraint in a generic function.

```ts twoslash
// @errors: 2345
const myGenericFunc = <T extends {}>(t: T) => {
  return t;
};

const result1 = myGenericFunc("str");
const result2 = myGenericFunc(123);
const result3 = myGenericFunc(true);
```

Inside `myGenericFunc`, we want to make sure that we can't pass `null` or `undefined` into the generic function. If we hover over `myGenericFunc` here, you can see that it's capturing `str` and returning it in the results here.

But it fails when we try to pass in null or undefined.

```ts twoslash
// @errors: 2345
const myGenericFunc = <T extends {}>(t: T) => {
  return t;
};

// ---cut---

const result4 = myGenericFunc(null);
const result5 = myGenericFunc(undefined);
```

### Conclusion

So, you probably shouldn't be using the `{}` type really anywhere. And you'll have likely come to this article because you found a linting rule that's preventing you from using it. That is why it doesn't represent what you think, but it's occasionally useful for constraining generics.
