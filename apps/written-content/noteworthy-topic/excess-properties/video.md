---
height: 1920
width: 1080
music: true
---

```ts !!
// Let's create some
// FetchOptions...
type FetchOptions = {
  url: string;
  timeout?: number;
};
```

```ts !!
type FetchOptions = {
  url: string;
  timeout?: number;
};

// And use it to type
// myFetch...
const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};
```

```ts !!
// @noErrors
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// When we call it with
// timeout misspelled...
myFetch({
  url: "/user.json",
  timeOut: 5000,
});
```

```ts !!
// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// We get an error, as
// expected.
myFetch({
  url: "/user.json",
  timeOut: 5000,
});
```

```ts !!
// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// But if we move the
// object outside the
// function call...
const opts = {
  url: "/user.json",
  timeOut: 5000,
};

myFetch(opts);
```

```ts !!
// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

const opts = {
  url: "/user.json",
  timeOut: 5000,
};

// There's no more error.
// What on earth?
myFetch(opts);
```

```ts !!
// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// TypeScript doesn't really
// care about 'excess
// properties' on objects.
const opts = {
  url: "/user.json",
  timeOut: 5000,
};

myFetch(opts);
```

```ts !!
// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// We can add a bunch of
// properties here, and
// TS won't complain.
const opts = {
  url: "/user.json",
  timeOut: 5000,
  method: "GET",
  headers: {
    "Content-Type":
      "application/json",
  },
  body: JSON.stringify({}),
};

myFetch(opts);
```

```ts !!
// @noErrors
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// We can fix this by typing
// opts as FetchOptions:
const opts: FetchOptions = {
  url: "/user.json",
  timeOut: 5000,
};

myFetch(opts);
```

```ts !!
// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// And we get our error back.
const opts: FetchOptions = {
  url: "/user.json",
  timeOut: 5000,
};

myFetch(opts);
```

```ts !!
// @errors: 2561
type FetchOptions = {
  url: string;
  timeout?: number;
};

const myFetch = async (
  opts: FetchOptions,
) => {
  // ...
};

// Or, passing it directly
// to the function:
myFetch({
  url: "/user.json",
  timeOut: 5000,
});
```
