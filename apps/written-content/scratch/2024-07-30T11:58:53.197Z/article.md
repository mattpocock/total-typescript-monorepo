```ts twoslash
// @types: node
import { setTimeout } from "node:timers/promises";

// NUMBER ONE
const promise = async () => {
  await setTimeout(1);
  console.log(`Tick ${Date.now()}`);

  return promise();
};

promise();
```

```ts twoslash
// @types: node
import { setTimeout } from "node:timers/promises";

// NUMBER TWO
const promise = async () => {
  await setTimeout(1);
  console.log(`Tick ${Date.now()}`);
};

while (true) {
  await promise();
}
```
