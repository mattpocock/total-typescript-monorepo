```ts !!
// Imagine that we want a type to
// describe the state of a data fetch.
type DataState = {
  isLoading: boolean;
  data?: string;
  error?: string;
};
```

```ts !!
// This type is pretty bad, because it allows
// incorrect combinations of properties.
type DataState = {
  isLoading: boolean;
  data?: string;
  error?: string;
};
```

```ts !!
type DataState = {
  isLoading: boolean;
  data?: string;
  error?: string;
};

// This one is loading, but also has data
// and an error!
const example: DataState = {
  isLoading: true,
  data: "Hello, world!",
  error: "Oh dear!",
};
```

```ts !!
type DataState = {
  isLoading: boolean;
  data?: string;
  error?: string;
};

// This one has no data, no error,
// but also isn't loading. What?
const example: DataState = {
  isLoading: false,
};
```

```ts !!
// Let's refactor this to be a
// discriminated union.
type DataState = {
  isLoading: boolean;
  data?: string;
  error?: string;
};
```

```ts !!
// Let's create a loading state...
type LoadingState = {
  status: "loading";
};
```

```ts !!
type LoadingState = {
  status: "loading";
};

// A success state...
type SuccessState = {
  status: "success";
  data: string;
};
```

```ts !!
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

// ...and an error state.
type ErrorState = {
  status: "error";
  error: string;
};
```

```ts !!
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};

// Now DataState will be a union of the
// three possible states.
type DataState = LoadingState | SuccessState | ErrorState;
```

```ts !!
// @errors: 2353
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// This means that invalid combinations
// are no longer possible!
const example: DataState = {
  status: "error",
  data: "abc",
};
```

```ts !!
// @errors: 2353
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// For instance, we can't have a `data` field
// in the `error` state.
const example: DataState = {
  status: "error",
  data: "abc",
};
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// And the 'success' status must contain a
// data field:
const example: DataState = {
  status: "success",
};
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// This gets really useful when you're trying
// to do things based on which state you're in.
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// Let's create a showUI function...
const showUI = (state: DataState) => {};
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

const showUI = (state: DataState) => {
  // If we narrow to the loading state...
  if (state.status === "loading") {
  }
};
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

const showUI = (state: DataState) => {
  if (state.status === "loading") {
    // Inside the braces, TypeScript knows that state
    // is of type LoadingState!

    console.log(state);
    //          ^?
  }
};
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// This means we can safely implement all branches
// of our logic:
const showUI = (state: DataState) => {
  if (state.status === "loading") {
    return "Loading...";
  } else if (state.status === "success") {
    return `Data: ${state.data}`;
  } else {
    return `Error: ${state.error}`;
  }
};
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// We can even use a switch statement if we want to:
const showUI = (state: DataState) => {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `Data: ${state.data}`;
    case "error":
      return `Error: ${state.error}`;
  }
};
```

```ts !!
// @errors: 2353, 2322
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// If we add a return type to our function...
const showUI = (state: DataState): string => {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `Data: ${state.data}`;
    case "error":
      return `Error: ${state.error}`;
  }
};
```

```ts !!
// @noErrors
// @errors: 2353, 2322, 2366
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// And comment out the 'error' case...
const showUI = (state: DataState): string => {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `Data: ${state.data}`;
    // case "error":
    //   return `Error: ${state.error}`;
  }
};
```

```ts !!
// @errors: 2353, 2322, 2366
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};
// ---cut---
type DataState = LoadingState | SuccessState | ErrorState;

// It'll give us a warning that we didn't implement
// all the cases!
const showUI = (state: DataState): string => {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `Data: ${state.data}`;
    // case "error":
    //   return `Error: ${state.error}`;
  }
};
```

```ts !!
// @errors: 2353, 2322, 2366
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string;
};

type ErrorState = {
  status: "error";
  error: string;
};

// So, discriminated unions can make your app's
// types extremely robust.
type DataState = LoadingState | SuccessState | ErrorState;
```

```ts !!
// And is a much better approach than these
// 'bags of optionals'.
type DataState = {
  isLoading: boolean;
  data?: string;
  error?: string;
};
```
