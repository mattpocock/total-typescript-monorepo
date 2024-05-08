```ts twoslash
// @errors: 2345
const getDeepValue = <
  TObj,
  TKey extends keyof TObj,
  TSecondKey extends keyof TObj[TKey]
>(
  obj: TObj,
  key: TKey,
  secondKey: TSecondKey
) => {
  return obj[key][secondKey];
};

const obj = {
  a: {
    b: "I'm B!",
    c: "I'm C!",
  },
} as const;

const b = getDeepValue(obj, "a", "b");
//    ^?

const d = getDeepValue(obj, "a", "d");
```
