```ts twoslash
// @target: ESNext
const urlSearchParams = new URLSearchParams(
  window.location.search
);

const params = Object.fromEntries(
  //  ^?
  urlSearchParams.entries()
);
```
