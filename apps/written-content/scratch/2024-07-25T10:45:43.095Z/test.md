```ts !!
// @errors: 2345
// @types: node
import { styleText } from "node:util";

const text = styleText(
  // You can even add modifiers!
  "awd",
  "Hello world!",
);

console.log(text);
```
