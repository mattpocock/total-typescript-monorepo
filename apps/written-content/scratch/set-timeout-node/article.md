---
musicFullVolume: true
height: 1080
---

```ts !!
// Say goodbye to the 'sleep' function...
const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const main = async () => {
  console.log("Start");
  await sleep(2000);
  console.log("End");
};
```

```ts !!
// @types: node
import { setTimeout } from "node:timers/promises";

// ...and hello to the built-in setTimeout.
const main = async () => {
  console.log("Start");
  await setTimeout(2000);
  console.log("End");
};
```
