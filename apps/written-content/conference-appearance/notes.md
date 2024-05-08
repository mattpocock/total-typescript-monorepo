- TypeScript (always spelled with a capital S)
- Type Parameters
- Type Arguments

```ts twoslash
type ResponseShape<T = undefined> = {
  data: T;
  code: string;
};

type GetUserResult = ResponseShape<{
  name: string;
  age: number;
}>;
```
