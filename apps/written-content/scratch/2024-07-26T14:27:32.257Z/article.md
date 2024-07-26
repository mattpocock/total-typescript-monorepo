```ts twoslash
// @errors: 2869
function isValid(value: number, opts: any) {
  return (
    // value < opts.max will never be null,
    // so we'll never hit '100'. TypeScript
    // now gives an error since 5.6!
    value < opts.max ?? 100
  );
}
```

```ts twoslash
// @errors: 2869
// Here's the fix:
function isValid(value: number, opts: any) {
  return (
    // The fix is to wrap opts.max in
    // parentheses!
    value < (opts.max ?? 100)
  );
}
```
