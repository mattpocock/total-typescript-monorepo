# Nullish Coalescing: The Double Question Mark (??) Operator

## Quick Explanation

- The Double Question Mark (`??`) is the [nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) operator. It lets you provide a default value when a value is `null` or `undefined`.

```ts twoslash
const foo = null ?? "default string";
//    ^?
```

- It's different from the OR operator (`||`) because it only checks for `null` or `undefined`, not other falsy values like `0` or `""`.

```ts twoslash
const foo = "" || "default string";

console.log(foo); // 'default string'

const bar = "" ?? "default string";

console.log(bar); // ''
```
