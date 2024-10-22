```ts nodeslash
import { inspect } from "node:util";

const myObj = {
  a: {
    b: {
      c: {
        d: {
          somethingCool: {},
        },
      },
    },
  },
};

console.dir(myObj);
```
