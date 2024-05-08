```ts twoslash
type Example = {
  first?: never;
  second?: undefined;
};

type Result = Example["first"];
//   ^?

type Result2 = Example["second"];
//   ^?
```
