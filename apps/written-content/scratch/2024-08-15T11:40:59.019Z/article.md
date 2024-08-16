```ts twoslash
// 1. Create a custom error class
class TooHighError extends Error {
  message = "Input too high";
}

function createNumber() {
  const num = Math.random();
  if (num > 0.5) {
    // 2. Return the error instead of throwing it
    return new TooHighError();
  }

  return num;
}
```

```ts twoslash
class TooHighError {
  message = "Input too high";
}

function createNumber() {
  const num = Math.random();
  if (num > 0.5) {
    return new TooHighError();
  }

  return num;
}

// ---cut---
// 3. The result is either number or the error
const result = createNumber();
//    ^?

// 4. This forces you to handle the error...
if (result instanceof TooHighError) {
  console.log(result.message);
} else {
  // 5. ...before seeing the result
  console.log(result);
  //          ^?
}
```
