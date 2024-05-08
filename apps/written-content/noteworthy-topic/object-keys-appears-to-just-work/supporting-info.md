```ts twoslash
const typedObjectKeys = <
  TVal,
  TObj extends Record<string, TVal>
>(
  obj: TObj
): Array<keyof TObj> => {
  return Object.keys(obj);
};
```
