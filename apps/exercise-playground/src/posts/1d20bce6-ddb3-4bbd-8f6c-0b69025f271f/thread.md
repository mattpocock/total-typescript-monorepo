```ts twoslash
// @types: node
// @filename: example.cjs
module.exports = {
  foo: "bar",
};

// @filename index.js
// ---cut---
const example = require("./example");
```

```ts twoslash
// @types: node
// @module: NodeNext
// @moduleResolution: NodeNext

// @filename: example.cjs

module.exports = {
  foo: "bar",
};

// @filename: index.cjs
// ---cut---
import example = require("./example.cjs");

console.log(example);
//          ^?
```
