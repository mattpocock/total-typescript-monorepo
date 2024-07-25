---
music: true
---

```ts !!
import chalk from "chalk";

// You can use chalk to style the text
// you print to the console...
const text = chalk.red("Hello world!");

console.log(text);
```

```ts !!
// @types: node
import { styleText } from "node:util";

// Or, you can use the new styleText
// from Node 21...
const text = styleText("red", "Hello world!");

console.log(text);
```

```ts !!
// @types: node
import { styleText } from "node:util";

const text = styleText(
  // You can even add modifiers!
  ["bgBlue", "white", "bold", "underline"],
  "Hello world!",
);

console.log(text);
```
