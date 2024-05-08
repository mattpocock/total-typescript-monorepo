Here are some examples of building custom type helpers in TypeScript that are useful for application development:

1. `FilterKeys`: A custom type helper that filters object keys based on their value types.

```typescript
type FilterKeys<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
};
```

2. `OptionalKeys`: A custom type helper that makes specified keys optional.

```typescript
type OptionalKeys<T, K extends keyof T> = Omit<
  T,
  K
> &
  Partial<Pick<T, K>>;
```

3. `RequireOnlyOne`: A custom type helper that ensures at least one property of a specified set is required.

```typescript
type RequireOnlyOne<
  T,
  K extends keyof T = keyof T
> = T &
  {
    [P in K]-?: Required<Pick<T, P>> &
      Partial<Record<Exclude<K, P>, undefined>>;
  }[K];
```

4. `DeepPartial`: A custom type helper that makes all properties of a nested object optional.

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

5. `ValueOf`: A custom type helper that extracts the value type from an object or array.

```typescript
type ValueOf<T> = T[keyof T];
```

6. `NonNullableProps`: A custom type helper that makes all non-nullable properties of an object required.

```typescript
type NonNullableProps<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
```

7. `MakeOptional`: A custom type helper that makes all properties of an object optional.

```typescript
type MakeOptional<T> = {
  [P in keyof T]?: T[P];
};
```

8. `Pluck`: A custom type helper that extracts a specific property from an object and returns it as a new type.

```typescript
type Pluck<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

9. `Diff`: A custom type helper that returns the difference between two types, i.e. properties that exist in one type but not the other.

```typescript
type Diff<T, U> = Pick<
  T,
  Exclude<keyof T, keyof U>
>;
```

10. `UnionToIntersection`: A custom type helper that converts a union of types to their intersection.

```typescript
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
```

11. `Writable`: A custom type helper that ensures all properties of an object are writable.

```typescript
type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};
```

12. `PartialDeep`: A custom type helper that makes all properties of a nested object optional, up to a specified depth.

```typescript
type PartialDeep<T, Depth extends number = -1> =
  Depth extends 0 ? T : {
    [K in keyof T]?: T[K] extends object
      ? PartialDeep<T[K], Depth extends -1 ? -1 : Depth - 1>
      : T[K];
  };
```

13. `Flat`: A custom type helper that flattens a type by recursively removing object nesting and merging properties.

```typescript
type Flat<T> = T extends object
  ? { [K in keyof T]: Flat<T[K]> }
  : T;
```

14. `Overwrite`: A custom type helper that overwrites specified properties in a type with the corresponding types from another type.

```typescript
type Overwrite<T, U> = Pick<
  T,
  Exclude<keyof T, keyof U>
> &
  U;
```

15. `Mutable`: A custom type helper that makes all properties of an object mutable.

```typescript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
```

16. `First`: A custom type helper that returns the first element type of a tuple or array.

```typescript
type First<T extends any[]> = T extends []
  ? never
  : T[0];
```

17. `Last`: A custom type helper that returns the last element type of a tuple or array.

```typescript
type Last<T extends any[]> = T extends []
  ? never
  : T[Length<Tail<T>>];
```

18. `ReadonlyDeep`: A custom type helper that makes all properties of a nested object readonly.

```typescript
type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? ReadonlyDeep<T[K]>
    : T[K];
};
```

19. `WritableDeep`: A custom type helper that makes all properties of a nested object writable.

```typescript
type WritableDeep<T> = {
  -readonly [K in keyof T]: T[K] extends object
    ? WritableDeep<T[K]>
    : T[K];
};
```

20. `PickByType`: A custom type helper that picks properties from an object that match a specific value type.

```typescript
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U
    ? K
    : never]: T[K];
};
```

21. `CamelCase`: A custom type helper that converts a string literal type to camelCase.

```typescript
type CamelCase<S extends string> =
  S extends `${infer F}-${infer R}`
    ? `${Lowercase<F>}${CamelCase<Capitalize<R>>}`
    : `${Lowercase<S>}`;
```

22. `SnakeCase`: A custom type helper that converts a string literal type to snake_case.

```typescript
type SnakeCase<S extends string> =
  S extends `${infer F}-${infer R}`
    ? `${SnakeCase<`${F}_${R}`>}`
    : `${Lowercase<S>}`;
```

23. `KebabCase`: A custom type helper that converts a string literal type to kebab-case.

```typescript
type KebabCase<S extends string> =
  S extends `${infer F}_${infer R}`
    ? `${KebabCase<`${F}-${R}`>}`
    : `${Lowercase<S>}`;
```

24. `UppercaseKeys`: A custom type helper that converts all the keys of an object to uppercase.

```typescript
type UppercaseKeys<T> = {
  [K in keyof T as Uppercase<string & K>]: T[K];
};
```

25. `LowercaseKeys`: A custom type helper that converts all the keys of an object to lowercase.

```typescript
type LowercaseKeys<T> = {
  [K in keyof T as Lowercase<string & K>]: T[K];
};
```
