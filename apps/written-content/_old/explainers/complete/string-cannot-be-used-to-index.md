# Type `string` can't be used to index type X

> Element implicitly has an 'any' type because expression of type 'X' can't be used to index type 'Y'.

This error is likely occurring because you're trying to use a type that's too loose to access an object's properties.

Try solving this using the playground below:

<Editor>

```typescript
const myObj = {
  a: 1,
  b: 2,
};

const access = (str: string) => {
  return myObj[str];
};
```

</Editor>

## Solution 1: Tighten the index

One solution is to try to make the type doing the indexing tighter. In this case, by changing `str` to `keyof typeof myObj`:

```typescript twoslash
const myObj = {
  a: 1,
  b: 2,
};

// ---cut---
const access = (str: keyof typeof myObj) => {
  return myObj[str];
};
```

This is very safe because it ensures that the string you're using to index into the object is one of the keys of the object. But it's not always possible.

## Solution 2: Loosen the object type

When you declare an object, TypeScript will try to infer the most specific type possible. In this case, it's inferring that `myObj` is an object with two properties, `a` and `b`, whose values are numbers.

If you want to loosen the type of the object, you can do so by adding a type annotation:

```typescript twoslash
const myObj: Record<string, number> = {
  a: 1,
  b: 2,
};
```

Now, we can access the object with any string - and also add any string to the object:

```typescript twoslash
const myObj: Record<string, number> = {
  a: 1,
  b: 2,
};

// ---cut---

// We can add new keys to the object!
myObj["c"] = 3;

const access = (str: string) => {
  // Accessing with string is perfectly OK!
  return myObj[str];
};
```

Note that if you choose this approach, you should add [`noUncheckedIndexedAccess`](https://www.totaltypescript.com/tips/make-accessing-objects-safer-by-enabling-nouncheckedindexedaccess-in-tsconfig) to your tsconfig, which will give you extra safety when accessing the object.

## Solution 3: Cast the index

Finally, you can do a cast inside the access itself:

```typescript twoslash
const myObj = {
  a: 1,
  b: 2,
};

// ---cut---

const access = (str: string) => {
  return myObj[str as keyof typeof myObj];
};
```

This is slightly less safe and might result in an unexpected result because we're fooling TypeScript into thinking that `myObj[str]` will always return a `number`. But if we call `access` with `c`, we won't get a number back at runtime:

```typescript twoslash
const myObj = {
  a: 1,
  b: 2,
};

const access = (str: string) => {
  return myObj[str as keyof typeof myObj];
};

// ---cut---

/**
 * TS things it's a number, but it's actually undefined!
 */
const cResult = access("c");
//    ^?
```

If possible, you should be using solution 1 or 2 instead - but having this cast in your pocket can be useful.
