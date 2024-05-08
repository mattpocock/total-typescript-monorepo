```ts twoslash
declare const func:
  | ((a: string) => void)
  | ((a: number) => void)
  | ((a: boolean) => void);

func("123123");
```
