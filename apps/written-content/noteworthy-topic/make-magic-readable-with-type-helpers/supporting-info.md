```ts twoslash
type LooseAutocomplete<T extends string> =
  | T
  | (string & {});
```

```ts twoslash
type Obj = {
  id: string;
  name: string;
  age: number;
};

type StringKeys = {
  [K in keyof Obj]: Obj[K] extends string ? K : never;
}[keyof Obj];
```

```ts twoslash
/**
 * Get the keys of an object whose values are strings
 *
 * @example
 *
 * type AorB = GetStringKeys<{
 *   a: string;
 *   b: string;
 *   c: number
 * }>;
 */
type GetStringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];
```
