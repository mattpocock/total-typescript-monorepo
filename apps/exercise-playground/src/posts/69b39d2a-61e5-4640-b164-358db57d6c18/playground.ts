// http://localhost:3004/posts/69b39d2a-61e5-4640-b164-358db57d6c18/edit

const obj = {
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

console.dir(obj, { depth: 0 });
// { a: [Object] }

console.dir(obj, { depth: 1 });
// { a: { b: [Object] } }

console.dir(obj, { depth: 2 });
// { a: { b: { c: [Object] } } }

console.dir(obj, { depth: Infinity });
// {
//   a: {
//     b: { c: { d: { e: 'hello!' } } }
//   }
// }
