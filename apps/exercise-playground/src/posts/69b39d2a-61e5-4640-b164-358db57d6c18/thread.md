```ts twoslash
const deeplyNestedObj = {
  a: {
    b: {
      c: {
        d: {
          e: "hello!",
        },
      },
    },
  },
};

console.dir(deeplyNestedObj, { depth: 0 });
// { a: [Object] }

console.dir(deeplyNestedObj, { depth: 1 });
// { a: { b: [Object] } }

console.dir(deeplyNestedObj, { depth: 2 });
// { a: { b: { c: [Object] } } }

console.dir(deeplyNestedObj, { depth: Infinity });
// {
//   a: {
//     b: { c: { d: { e: 'hello!' } } }
//   }
// }
```
