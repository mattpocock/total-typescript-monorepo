```ts twoslash
// BEFORE

type AnyKeyAllowed = {
  [key: string | number | symbol]: string;
};
```

```ts twoslash
// AFTER

type AnyKeyAllowed = {
  [key: PropertyKey]: string;
};
```
