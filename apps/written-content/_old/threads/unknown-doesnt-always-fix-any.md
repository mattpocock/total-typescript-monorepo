## 'unknown' is not always a fix for 'any'

Why any's happen, how to stop them, and why unknown isn't necessarily a better solution 🧵

https://twitter.com/mattpocockuk/status/1568712822858694657/photo/1

---

Any 'any' in a codebase is a cause for concern. That's because it disables typechecking on the thing it's assigned to.

Pass it to a function parameter? You then can't guarantee anything about that function parameter.

```typescript
const groupBy = (arr: any[], key: any) => {
  const result: any = {};
  arr.forEach((item) => {
    // How do we know that item is an object?
    // Or that it has a property the same
    // as the key we pass in?
    const resultKey = item[key];

    if (result[resultKey]) {
      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });

  return result;
};
```

---

An any can 'leak' across your application. If we use this function, we're going to get back 'any' - which disables type checking in yet more places.

Can you spot the 2 errors below?

```typescript
const array = [
  { name: "John", age: 20 },
  { name: "Jane", age: 20 },
  { name: "Jack", age: 30 },
];

const result = groupBy(array);
// result is any!

result[20].foreach((item) => {
  // item is any!
  console.log(item.nme, item.age);
});
```

---

But why would an 'any' be added to a codebase?

The first reason that comes to mind is that you're trying to solve a bug you don't understand.

TypeScript has plenty of hard edges that can feel unintuitive for beginners.

```typescript
const keys = ["a", "b"];

const obj = {};

for (const key of keys) {
  // Element implicitly has an 'any' type because
  // expression of type 'string' can't be used to
  // index type '{}'.
  obj[key] = key;
}
```

```typescript
const keys = ["a", "b"];

// Phew, no more error
const obj: any = {};

for (const key of keys) {
  obj[key] = key;
}
```

---

By the way, the best way to solve this is either with a Record, or with an 'as' type - depending on how specific a type you want 'obj' to be.

```typescript
const keys = ["a", "b"];

// obj will be typed as a record where its
// properties can be any string
const obj: Record<string, string> = {};

for (const key of keys) {
  obj[key] = key;
}
```

```typescript
const keys = ["a", "b"] as const;

// obj will now be typed with the keys 'a' and 'b'
const obj = {} as Record<
  (typeof keys)[number],
  string
>;

for (const key of keys) {
  obj[key] = key;
}
```

---

Once you've levelled yourself up a little as a TS engineer, you should be able to get rid of those 'I don't know how to fix this' any's.

That's the intent of my free TS beginners course - check it out!

https://www.totaltypescript.com/tutorials/beginners-typescript

---

The other way any's creep into your code is when you don't use enough generics.

Imagine, for a moment, that TypeScript didn't have generics. How would you actually type this function?

```typescript
// How on earth do you type this function?

const groupBy = (arr, key) => {
  const result = {};
  arr.forEach((item) => {
    const resultKey = item[key];
    if (result[resultKey]) {
      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });
  return result;
};
```

---

Let's try our hardest to avoid using 'any'.

We know that the members of the array must be objects, so let's start with a Record<string, unknown>[] type.

```typescript
const groupBy = (
  arr: Record<string, unknown>[],
  key: string
) => {
  const result = {};
  arr.forEach((item) => {
    const resultKey = item[key];
    if (result[resultKey]) {
      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });
  return result;
};
```

---

But we immediately run into issues. We've said that the values of each 'item' is unknown, and you can't use unknown to index into result.

Gosh, ok.

```typescript
const groupBy = (
  arr: Record<string, unknown>[],
  key: string
) => {
  const result = {};
  arr.forEach((item) => {
    const resultKey = item[key];

    // Type 'unknown' cannot be used as an index type.
    if (result[resultKey]) {
      //       ^^^^^^^^^

      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });
  return result;
};
```

---

So, we try and cast item[key] to string, but this results in more crazy issues:

```typescript
const groupBy = (
  arr: Record<string, unknown>[],
  key: string
) => {
  const result = {};
  arr.forEach((item) => {
    const resultKey = item[key] as string;

    // No index signature with a parameter of
    // type 'string' was found on type '{}'.
    if (result[resultKey]) {
      //^^^^^^^^^^^^^^^^^

      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });
  return result;
};
```

---

The way to fix this is to add a type annotation to result, to represent the type that we're getting back.

Finally, no more errors.

```typescript
const groupBy = (
  arr: Record<string, unknown>[],
  key: string
) => {
  const result: Record<string, unknown[]> = {};
  arr.forEach((item) => {
    const resultKey = item[key] as string;
    if (result[resultKey]) {
      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });
  return result;
};
```

---

But after all of our efforts, the result of groupBy is now always Record<string, unknown[]>:

```typescript
const array = [
  { name: "John", age: 20 },
  { name: "Jane", age: 20 },
  { name: "Jack", age: 30 },
];

// result is Record<string, unknown[]>
const result = groupBy(array, "age");
```

---

Is this preferable to using 'any'?

In one sense, HELL YES. You'll get proper type-safety on the values of the result, meaning you catch errors like misspelled array methods.

```typescript
const result = groupBy(array, "age");

// Property 'foreach' does not exist on type
// 'unknown[]'. Did you mean 'forEach'?
result[20].foreach((item) => {});
```

---

But in another sense, we've just changed the problem.

Instead of any's spreading across our app, we have 'unknown'.

unknown is an extremely 'yelly' type. It errors whenever you access a property or assign it to something that isn't unknown.

```typescript
const result = groupBy(array, "age");

result[20].forEach((item) => {
  // 'item' is of type 'unknown'.
  item.name;

  // Type 'unknown' is not assignable to type
  // '{ name: string; age: number; }'.
  const typedItem: { name: string; age: number } =
    item;
});
```

---

You can validate your way to the desired, if you want.

But, frankly, what a lot of faff.

We _know_ that item has a name and an age. So this validation is pointless runtime bloat.

```typescript
result[20].forEach((item) => {
  if (
    typeof item === "object" &&
    item &&
    "age" in item &&
    "name" in item &&
    typeof item.age === "number" &&
    typeof item.name === "string"
  ) {
    // Hooray, it's a string!
    item.name;

    // Hooray, it's a number!
    item.age;
  }
});
```

---

Unnecessary anys in your codebase are bad because they cause bugs.

Unnecessary unknowns in your codebase are bad because they bloat your runtime code with boilerplate.

And, from the steps we've seen above - typing a utility function to return the unknowns in the right place is NOT easy.

---

The way out of this catch-22 is generics.

This code below is extremely complex, but it perfectly describes the behaviour of the function.

Consumers of the function don't need to worry about any's or unknowns - it behaves exactly as they expect to.

```typescript
const groupBy = <
  TObj extends Record<string, unknown>,
  TKey extends keyof TObj
>(
  arr: TObj[],
  key: TKey
) => {
  const result = {} as Record<
    TObj[TKey] & PropertyKey,
    TObj[]
  >;
  arr.forEach((item) => {
    const resultKey = item[key] as TObj[TKey] &
      PropertyKey;
    if (result[resultKey]) {
      result[resultKey].push(item);
    } else {
      result[resultKey] = [item];
    }
  });
  return result;
};
```

```typescript
const result = groupBy(array, "age");

result[20].forEach((item) => {
  // No errors, no validation needed!
  console.log(item.name, item.age);
});
```

---

So if you're concerned about any's in your codebase, you need to know generics.

Total TypeScript is _the_ way to learn deeply about generics, and it's 10% off for a few more days.

https://totaltypescript.com
