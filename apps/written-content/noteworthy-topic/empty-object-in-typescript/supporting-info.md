{}

or Object

```ts twoslash
// @errors: 2322

const allNotNull: Array<Object> = [
  "hello",
  123,
  true,
  {
    foo: "whatever",
  },
  null,
  undefined,
];
```

```ts twoslash
// @errors: 2322
const example1: {} = "str";
const example2: {} = 123;
const example3: {} = true;
const example4: {} = {
  foo: "whatever",
};

const example5: {} = null;
const example6: {} = undefined;
```

```ts twoslash
// @errors: 2322
const example1: Object = "str";

const example2: Object = null;
```
