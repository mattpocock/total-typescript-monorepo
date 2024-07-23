```ts !!
// Let's imagine we want to create a useStatuses
// function that will handle switching between a
// set of defined statuses.
const useStatuses = (statuses: string[]) => {
  // ...implementation
  return statuses;
};
```

```ts !!
const useStatuses = (statuses: string[]) => {
  // ...implementation
  return statuses;
};

// We want to use it like this, where we can
// pass in an array of statuses.
const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);
```

```ts !!
const useStatuses = (statuses: string[]) => {
  // ...implementation
  return statuses;
};

const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);

// But currently, the type of `statuses` is
// always inferred as `string[]`, no matter
// what we pass in.
console.log(statuses);
//          ^?
```

```ts !!
// We can try to fix this by making useStatuses
// a generic function.
const useStatuses = (statuses: string[]) => {
  // ...implementation
  return statuses;
};

const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);
```

```ts !!
// To do that, we add a type parameter to
// useStatuses...
const useStatuses = <TStatus>(statuses: string[]) => {
  // ...implementation
  return statuses;
};

const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);
```

```ts !!
// Constrain it to string to ensure that all
// statuses are strings...
const useStatuses = <TStatus extends string>(
  statuses: string[],
) => {
  // ...implementation
  return statuses;
};

const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);
```

```ts !!
// Then reference TStatus in the function itself.
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  // ...implementation
  return statuses;
};

const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);
```

```ts !!
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  // ...implementation
  return statuses;
};

const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);

// Now, statuses is an array of those
// three strings. Beautiful!
console.log(statuses);
//          ^?
```

```ts !!
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  // We could imagine adding an update function
  // to useStatuses...
  const update = () => {
    // ...implementation
  };

  return statuses;
};
```

```ts !!
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  // Which is then typed using the `TStatus`
  // type:
  const update = (newStatus: TStatus) => {
    // ...implementation
  };

  return statuses;
};
```

```ts !!
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  const update = (newStatus: TStatus) => {
    // ...implementation
  };

  // And then passed back in an object:
  return {
    statuses,
    update,
  };
};
```

```ts !!
// @errors: 2345
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  const update = (newStatus: TStatus) => {
    // ...implementation
  };

  return {
    statuses,
    update,
  };
};

// ---cut---
const statuses = useStatuses([
  "loading",
  "error",
  "success",
]);

// Now, calling statuses.update with anything other
// than the defined statuses will be an error.
statuses.update("whatever");
```

```ts !!
// @errors: 2345
const useStatuses = <TStatus extends string>(
  statuses: TStatus[],
) => {
  const update = (newStatus: TStatus) => {
    // ...implementation
  };

  return {
    statuses,
    update,
  };
};

// ---cut---
const statuses = useStatuses([
  "loading",
  "error",
  "success",
  // ...until we add it to our initial statuses!
  "whatever",
]);

statuses.update("whatever");
```
