There's a common issue that comes up whenever you try to use `Array.reduce` to transform an array into an object. Learning how to fix it can teach you a lot about how to handle `Array.reduce` in general.

Here's a playground: see if you can fix the error in the code below.

<Editor>

```typescript
const array = [
  { key: "name", value: "Daniel" },
  { key: "age", value: "26" },
  { key: "location", value: "UK" },
];

const grouped = array.reduce((obj, item) => {
  obj[item.key] = item.value;
  return obj;
}, {});
```

</Editor>

## Why Is The Error Happening?

The error above is happening because `Array.reduce` is inferring the type of `obj` to be `{}`:

```ts twoslash
// @errors: 7053
const array = [
  { key: "name", value: "Daniel" },
  { key: "age", value: "26" },
  { key: "location", value: "UK" },
];

// ---cut---

const grouped = array.reduce((obj, item) => {
  //                          ^?

  // obj[item.key] = item.value;

  return obj;
}, {});
```

This is happening because of the second argument we're passing into `Array.reduce`: the empty object. TypeScript is inferring the type of `obj` to be the same as the type of the second argument.

This is a bit of a papercut when you first get used to using `Array.reduce`. If you're doing any kind of mutation inside the reduce, TypeScript won't be able to infer the type of the object you're creating.

So, we need to alert TypeScript that the object we're passing in is _not_ just an empty object. It's an object with a specific shape that we're going to build up over the course of the reduce.

## Solution 1: Assert The Type Of The Argument

The first solution is to use `as` on the second argument to `Array.reduce`:

```ts twoslash
const array = [
  { key: "name", value: "Daniel" },
  { key: "age", value: "26" },
  { key: "location", value: "UK" },
];

// ---cut---

const grouped = array.reduce((obj, item) => {
  obj[item.key] = item.value;
  return obj;
}, {} as Record<string, string>);
```

Now, TypeScript has more information about the type of `obj`. It knows that it's an object with string keys and string values.

The `as` is relatively safe here because we're not using it to lie to TypeScript - we're using it to give TypeScript more information.

There is a solution that doesn't involve type assertions, though.

## Solution 2: Annotate The Parameter

The second solution is to annotate the type of the `obj` parameter:

```ts twoslash
const array = [
  { key: "name", value: "Daniel" },
  { key: "age", value: "26" },
  { key: "location", value: "UK" },
];

// ---cut---

const grouped = array.reduce(
  (obj: Record<string, string>, item) => {
    obj[item.key] = item.value;
    return obj;
  },
  {}
);
```

This does the same thing as the `as` solution. Instead of hinting to TypeScript via the second argument, we're annotating the parameter directly.

There's another solution that's equally as safe:

## Solution 3: Pass a Type Argument

The third solution is to pass a type argument to `Array.reduce`:

```ts twoslash
const array = [
  { key: "name", value: "Daniel" },
  { key: "age", value: "26" },
  { key: "location", value: "UK" },
];

// ---cut---

const grouped = array.reduce<Record<string, string>>(
  (obj, item) => {
    obj[item.key] = item.value;
    return obj;
  },
  {}
);
```

This solution relies on understanding how `Array.reduce`'s TypeScript inference works. It has a single type parameter that captures the type that the reducer function returns.

By passing a type argument to `Array.reduce`, we're overriding the type that TypeScript infers for the reducer function.

## Conclusion

The error you get when using `Array.reduce` is a common one. It's a good example of how TypeScript's type inference can occasionally get in your way.

The solutions to this error are all relatively safe. They all involve giving TypeScript more information about the type of the object you're creating.

I prefer solutions 2 or 3, as they don't involve using `as` - but each are useful to have in your toolbox.
