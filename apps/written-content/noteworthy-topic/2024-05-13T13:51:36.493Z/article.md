```json
{
  // For an app, transpiled with
  // tsc, that runs in the DOM:
  "extends": "@total-typescript/tsconfig/tsc/dom/app"
}
```

```json
{
  // For a library, with an external bundler
  // that doesn't run in the DOM
  "extends": "@total-typescript/tsconfig/bundler/library/no-dom"
}
```
