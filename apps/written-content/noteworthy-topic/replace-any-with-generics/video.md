---
posted: 2024-06-24
width: 1550
height: 700
---

```ts !!
// Here's a function that takes an array and
// returns a new array with only unique values.
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};
```

```ts !!
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};

// This will return [1, 2, 3].
const result = uniqueArray([1, 2, 3, 1, 2, 3]);
```

```ts !!
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};

// Except the type of the result doesn't match
// what gets passed in. It's always any[]:
const result = uniqueArray([1, 2, 3, 1, 2, 3]);
//     ^?
```

```ts !!
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};

// Even if you pass in strings...
const result = uniqueArray(["a", "b", "c", "a", "b", "c"]);
//     ^?
```

```ts !!
// We can fix this by adding a type parameter of
// <T> to uniqueArray...
const uniqueArray = <T>(arr: any[]) => {
  return Array.from(new Set(arr));
};

const result = uniqueArray(["a", "b", "c", "a", "b", "c"]);
```

```ts !!
// ...and then using that type parameter to
// type the array passed in.
const uniqueArray = <T>(arr: T[]) => {
  return Array.from(new Set(arr));
};

const result = uniqueArray(["a", "b", "c", "a", "b", "c"]);
```

```ts !!
// Now, the result will be typed as string[].
const uniqueArray = <T>(arr: T[]) => {
  return Array.from(new Set(arr));
};

const result = uniqueArray(["a", "b", "c", "a", "b", "c"]);
//     ^?
```

```ts !!
// And if we change it to numbers...
const uniqueArray = <T>(arr: T[]) => {
  return Array.from(new Set(arr));
};

// ...the result will be typed as number[].
const result = uniqueArray([1, 2, 3, 1, 2, 3]);
//     ^?
```

```ts !!
// Here's the before...
const uniqueArray = (arr: any[]) => {
  return Array.from(new Set(arr));
};

const result = uniqueArray([1, 2, 3, 1, 2, 3]);
//    ^?
```

```ts !!
// ...and here's the after.
const uniqueArray = <T>(arr: T[]) => {
  return Array.from(new Set(arr));
};

const result = uniqueArray([1, 2, 3, 1, 2, 3]);
//    ^?
```
