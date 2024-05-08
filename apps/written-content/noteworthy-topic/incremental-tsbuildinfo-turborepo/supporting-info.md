```json
// tsconfig.json

{
  "compilerOptions": {
    "incremental": true
  }
}
```

```json
// turbo.json

{
  "pipeline": {
    "lint": {
      "outputs": ["*.tsbuildinfo"]
    }
  }
}
```
