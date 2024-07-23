```ts twoslash
// @errors: 2345

declare const brand: unique symbol;

export type Brand<T, Brand extends string> = T & {
  [brand]: Brand;
};

// ---cut---

// 1. Branded type for an absolute path, eg. "/usr/bin"
export type AbsolutePath = Brand<string, "AbsolutePath">;

// 2. Branded type for a relative path
export type RelativePath = Brand<string, "RelativePath">;
```

```ts twoslash
// @errors: 2345
declare const brand: unique symbol;

export type Brand<T, Brand extends string> = T & {
  [brand]: Brand;
};

// 1. Branded type for an absolute path, eg. "/usr/bin"
export type AbsolutePath = Brand<string, "AbsolutePath">;

// 2. Branded type for a relative path
export type RelativePath = Brand<string, "RelativePath">;

// ---cut---

const relativePath = "src/index.ts" as RelativePath;
const doSomethingWithAbsolute = (path: AbsolutePath) => {
  // ... implementation
};

// 3. Prevents you from being confused between them!
doSomethingWithAbsolute(relativePath);
```
