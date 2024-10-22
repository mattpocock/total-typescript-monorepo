```ts nodeslash
// @errors: 2339
const data = {};

// ---cut---
// BAD - doesn't narrow the type in TS
if (data.hasOwnProperty("id")) {
  console.log(data.id);
}

// GOOD - narrows the type!
if ("id" in data) {
  console.log(data.id);
}
```
