// http://localhost:3004/posts/4f4159af-eacd-4306-82ff-4b5918b638c4/edit

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

const output = inspect(myObj, {
  // Colorize the output
  colors: true,
  // How wide the output should be in chars
  breakLength: 80,
  // How many properties deep should be visualised
  depth: Infinity,
  // How many array members should be shown
  maxArrayLength: Infinity,
  // How long strings should be
  maxStringLength: Infinity,
  // Display numbers as 100_000, not 100000
  numericSeparator: true,
  // Sort object properties alphabetically
  sorted: true,
});

console.log(output);
