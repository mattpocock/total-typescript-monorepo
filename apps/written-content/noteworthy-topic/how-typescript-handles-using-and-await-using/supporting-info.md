```ts twoslash
// @target: esnext
// @errors: 2850
const randomObj = {};

using x = randomObj;
```

```ts twoslash
// @target: esnext
const randomObj = {
  [Symbol.dispose]() {},
};

const x = randomObj;
```

```ts twoslash
// @target: esnext
// @errors: 2851

export {};

//---cut---

const randomObj = {};

await using x = randomObj;
```
