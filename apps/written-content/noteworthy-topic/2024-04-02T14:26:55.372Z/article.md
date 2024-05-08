```ts twoslash
const myFunc = (constraint: { prop?: string }) => {
  if (constraint.prop) {
    // 1. If a getter is passed in which returns undefined
    // the second time it's accessed, this will error
    console.log(constraint.prop.toUpperCase());
  }
};

let index = 0;

myFunc({
  // 2. For example...
  get prop() {
    index++;
    return index > 1 ? undefined : "foo";
  },
});
```
