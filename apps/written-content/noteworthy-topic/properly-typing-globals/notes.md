```ts twoslash
// @moduleDetection: force
// DON'T DO THIS:

const example = (window as any).foo();
//    ^?

// DO THIS:

declare global {
  interface Window {
    bar: () => string;
  }
}

const example2 = window.bar();
//     ^?
```
