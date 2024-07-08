```ts !!
// Imagine we create an isArrayOfStrings function
// to check if a value is... an array of strings.
const isArrayOfStrings = (value: unknown) => {};
```

```ts !!
// We first check if the value is an array...
const isArrayOfStrings = (value: unknown) => {
  return Array.isArray(value);
};
```

```ts !!
// Then, that every value inside is a string.
const isArrayOfStrings = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
};
```

```ts !!
const isArrayOfStrings = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
};

// Let's try it out - imagine some other function
// that calls isArrayOfStrings and uses the result.
const myFunc = (value: unknown) => {};
```

```ts !!
const isArrayOfStrings = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
};

// We can call it inside an if statement...
const myFunc = (value: unknown) => {
  if (isArrayOfStrings(value)) {
  }
};
```

```ts !!
const isArrayOfStrings = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
};

// Then, inside that if statement, TypeScript knows
// that value is an array of strings:
const myFunc = (value: unknown) => {
  if (isArrayOfStrings(value)) {
    console.log(value);
    //          ^?
  }
};
```

```ts !!
// This is without any actual annotations
// of the return type. This is a new feature
// in TS 5.5, and I freaking love it.
const isArrayOfStrings = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
};

const myFunc = (value: unknown) => {
  if (isArrayOfStrings(value)) {
    console.log(value);
    //          ^?
  }
};
```
