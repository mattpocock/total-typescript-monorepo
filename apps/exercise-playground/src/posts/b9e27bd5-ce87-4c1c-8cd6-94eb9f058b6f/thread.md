Am I dreaming? How long has `crypto.randomUUID()` been available?

Why on earth did I ever download a package to generate random UUIDs?

```ts twoslash
// "36b8f84d-df4e-4d49-b662-bcde71a8764f"
console.log(crypto.randomUUID());

// Works in the browser AND in Node, natively.

// BUT only works in https in the browser.
```
