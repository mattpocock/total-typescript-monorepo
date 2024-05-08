```ts twoslash
// 1. Using any...
async function retry(
  fn: () => Promise<any>,
  retries: number = 5
) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying...");
      return await retry(fn, retries - 1);
    }
    throw err;
  }
}

retry(() => Promise.resolve("hello")).then((str) => {
  // 2. ...results in any.
  console.log(str);
  //          ^?
});
```

```ts twoslash
// 3. Using a type parameter...
async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 5
) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying...");
      return await retry(fn, retries - 1);
    }
    throw err;
  }
}

retry(() => Promise.resolve("hello")).then((str) => {
  // 4. Means the type is inferred.
  console.log(str);
  //          ^?
});
```
