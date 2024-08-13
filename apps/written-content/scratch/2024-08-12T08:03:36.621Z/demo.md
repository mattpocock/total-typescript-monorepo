```ts twoslash
// BAD - incomprehensible unless you're
// a TypeScript Wizard
type Color = "primary" | "secondary" | (string & {});
```

```ts twoslash
type StringWithAutocompleteOptions<T extends string> =
  | T
  | (string & {});

// ---cut---
// GOOD - reusable and beginner-friendly
type Color = StringWithAutocompleteOptions<
  "primary" | "secondary"
>;
```
