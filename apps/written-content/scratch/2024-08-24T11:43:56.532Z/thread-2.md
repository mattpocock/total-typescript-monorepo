```ts twoslash
const promise = Promise.reject("abc");

// ---cut---
// BEFORE

promise.catch((error) => {
  console.log(error);
  //          ^?
});
```

```ts twoslash
const promise = Promise.reject("abc");

import "@total-typescript/ts-reset/promise-catch";
// ---cut---
// AFTER

promise.catch((error) => {
  console.log(error);
  //          ^?
});
```
