```ts twoslash
// Removes readonly from an object
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
```

```ts twoslash
// Removes optionality from an object
type RemovePartial<T> = {
  [P in keyof T]-?: T[P];
};
```
