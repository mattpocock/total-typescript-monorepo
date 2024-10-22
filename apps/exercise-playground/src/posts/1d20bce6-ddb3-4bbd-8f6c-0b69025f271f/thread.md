```ts nodeslash
// @filename: example.cjs
module.exports = {
  foo: "bar",
};

// @filename index.js
// ---cut---
const example = require("./example");
```
