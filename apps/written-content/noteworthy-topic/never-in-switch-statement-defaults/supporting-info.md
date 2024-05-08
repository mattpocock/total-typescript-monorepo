```ts twoslash
// This function returns never,
// because it never returns!
const getNever = () => {
  throw new Error("This function never returns");
};

const example = getNever();
//    ^?
```

```ts twoslash
// @errors: 2345
const getNever = () => {
  throw new Error("This function never returns");
};
// ---cut---
const fn = (input: never) => {};

// Nothing is assignable to never!
fn("hello");
fn(42);

// Except for never itself!

fn(getNever());
```

```ts twoslash
const getNever = () => {
  throw new Error("This function never returns");
};
// ---cut---
// But we can assign never to anything!

const str: string = getNever();
const num: number = getNever();
const bool: boolean = getNever();
const arr: string[] = getNever();
```
