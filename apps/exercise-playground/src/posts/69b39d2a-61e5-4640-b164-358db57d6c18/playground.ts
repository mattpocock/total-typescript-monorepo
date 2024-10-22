import { inspect } from "util";

const obj = {
  a: {
    b: {
      c: {
        d: {
          e: 100000000,
        },
      },
    },
  },
};

console.dir(obj, {
  depth: Infinity,
  colors: true,
  numericSeparator: true,
});
