```ts twoslash
const createSet = <T>() => {
  return new Set<T>();
};

const set = createSet(); // No error!
```

```ts twoslash
// @errors: 2345
const createSet = <
  T = "You must pass a type argument to createSet."
>() => {
  return new Set<T>();
};

const set = createSet();
//    ^?

set.add("hello");
```
