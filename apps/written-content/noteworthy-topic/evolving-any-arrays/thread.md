```ts twoslash
// @errors: 2339
const arr = [];

arr.push("str");

arr.forEach((elem) => elem.toUpperCase());

arr.push(1);

arr.forEach((elem) => elem.toUpperCase());
```

Wow
