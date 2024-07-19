---
musicFullVolume: true
height: 1080
---

```ts !!
// You can either write a custom sleep
// function...
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

// ...use the built-in setTimeout...
const main = async () => {
  console.log("Start");
  await setTimeout(2000);
  console.log("End");
};
```

```ts !!
// @types: node
import { scheduler } from "node:timers/promises";

// ...or scheduler.wait!
const main = async () => {
  console.log("Start");
  await scheduler.wait(2000);
  console.log("End");
};
```
