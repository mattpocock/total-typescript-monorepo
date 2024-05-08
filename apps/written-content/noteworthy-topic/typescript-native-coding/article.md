```ts twoslash
// Static object definitions are easy
// for TS to understand
const obj = {
  a: 1,
  b: 2,
};
```

```ts twoslash
// Dynamic object definitions need
// an extra assertion to make work
const obj = {} as {
  a: number;
  b: number;
};

obj.a = 1;
obj.b = 2;
```
