```ts twoslash
interface Methods {
  thisMethodIsAlwaysRequired(): void;
  thisMethodIsOptional?(): void;
}
```

```ts twoslash
interface Methods {
  thisMethodIsAlwaysRequired: () => void;
  thisMethodIsOptional?: () => void;
}
```
