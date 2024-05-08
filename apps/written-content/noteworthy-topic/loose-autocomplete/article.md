# Understanding (string & {})

## Quick Explanation

- Sometimes in TypeScript, you want to be able to express

## Full Explanation

```tsx twoslash
type Size = "small" | "medium" | "large" | string;

const Icon = (props: { size: Size }) => {
  return null;
};

<>
  <Icon size="small" />
  <Icon size="large" />
  <Icon size="10px" />
</>;
```

```tsx twoslash
type Size = "small" | "medium" | "large" | (string & {});

<>
  <Icon size="small" />
  <Icon size="large" />
  <Icon size="10px" />
</>;
```
