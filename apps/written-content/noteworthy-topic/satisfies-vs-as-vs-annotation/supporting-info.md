```ts twoslash
// @errors: 2339
const scores = {} satisfies Record<string, number>;

scores.english = 100;
```

```ts twoslash
// @errors: 2339
// Is the same as with satsfies!
const scores = {};

scores.english = 100;
```

```ts twoslash
// Variable annotations _widen_ the type of
// the variable
const scores: Record<string, number> = {};

// It works!
scores.english = 100;
```
