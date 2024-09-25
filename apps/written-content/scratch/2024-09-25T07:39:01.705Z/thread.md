```json
// BEFORE

{
  "exports": {
    "./": {
      // require() points to our .cjs code...
      "require": "./my-cjs-code.cjs",
      // ...and import points to our .mjs code.
      "import": "./my-esm-code.mjs"
    }
  }
}
```

```json
{
  "exports": {
    "./": {
      "module-sync": "./my-esm-code.mjs",
      "default": "./my-cjs-code.cjs"
    }
  }
}
```
