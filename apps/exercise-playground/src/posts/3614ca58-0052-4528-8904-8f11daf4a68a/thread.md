```ts nodeslash
console.log("This is generated automatically,");

console.log("from a markdown file.");

console.log("I'm calling it nodeslash.");

console.log("");

console.log("I love it.");
```

```ts nodeslash
const obj = {
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

// ---cut---
console.log("Depth 2:");
console.dir(obj, { depth: 2 });

console.log("Depth 3:");
console.dir(obj, { depth: 3 });

console.log("Depth INFINITE:");
console.dir(obj, { depth: Infinity });
```

```ts nodeslash
const obj = {
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

// ---cut---
console.log("Depth 2:");
console.dir(obj, { depth: 2 });

console.log("Depth 3:");
console.dir(obj, { depth: 3 });

console.log("Depth INFINITE:");
console.dir(obj, { depth: Infinity });
```
