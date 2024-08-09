So many folks don't know about structuredClone.

It's awesome, built-in, and supported in all major browsers.

```ts twoslash
// @noErrors
// Bad - calls .toString() on everything
const cloned = JSON.parse(JSON.stringify(obj));

// Bad - only one level deep
const cloned = { ...obj };

// Good - clones everything deeply
const cloned = structuredClone(obj);
```

A common pattern in JavaScript is to create an immutable clone of an object. This is useful when you want to make mutations to it without changing the original.

For that, you'll often see code using the spread operator: `{ ...obj }`.

```ts twoslash
// @noErrors
const originalObj = { a: 1, b: 2 };

const newObj = { ...originalObj };

newObj.b = 3;

console.log(originalObj); // { a: 1, b: 2 }
```

However, this only creates a shallow clone. This means that if the object has nested objects, they will be shared between the original and the clone.

Here, `deep` is shared between `originalObj` and `newObj`, not cloned across.

```ts twoslash
// @noErrors
const originalObj = { deep: { a: 1, b: 2 } };

const newObj = { ...originalObj };

newObj.deep.b = 3;

console.log(originalObj); // { deep: { a: 1, b: 3 } }
```

This can be circumvented by turning the object into JSON, a string representation of itself, then parsing it back into an object:

```ts twoslash
// @noErrors
const originalObj = { deep: { a: 1, b: 2 } };

const newObj = JSON.parse(JSON.stringify(originalObj));

newObj.deep.b = 3;

console.log(originalObj); // { deep: { a: 1, b: 2 } }
```

But this has some downsides. First, it calls `.toString()` on every property. This means that Dates will be turned into strings...

```ts twoslash
// @noErrors
const originalObj = { date: new Date() };

const newObj = JSON.parse(JSON.stringify(originalObj));

// "2024-09-08T00:00:00.000Z",
// or whatever time it is now
console.log(newObj.date);
```

...and Sets and maps would be converted to empty objects:

```ts twoslash
// @noErrors
const originalObj = {
  set: new Set([1, 2, 3]),
  map: new Map([
    ["a", 1],
    ["b", 2],
  ]),
};

const newObj = JSON.parse(JSON.stringify(originalObj));

console.log(newObj.set); // {}
console.log(newObj.map); // {}
```

Instead, we can use `structuredClone`, a built-in function that clones objects deeply and correctly.

It handles dates, sets, maps, and other objects correctly...

```ts twoslash
// @noErrors
const originalObj = {
  date: new Date(),
  set: new Set([1, 2, 3]),
  map: new Map([
    ["a", 1],
    ["b", 2],
  ]),
};

const newObj = structuredClone(originalObj);

console.log(newObj.date); // Date object
console.log(newObj.set); // Set object
console.log(newObj.map); // Map object
```

...and means that our code can't be mutated:

```ts twoslash
// @noErrors
const originalObj = { deep: { a: 1, b: 2 } };

const newObj = structuredClone(originalObj);

newObj.deep.b = 3;

console.log(originalObj); // { deep: { a: 1, b: 2 } }
```

I based this email on this great article, which goes into more depth on what structuredClone can't do, like cloning functions. Check it out!

https://www.builder.io/blog/structured-clone
