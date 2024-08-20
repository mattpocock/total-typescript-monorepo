```ts twoslash
import { err, ok, safeTry } from "neverthrow";

// ---cut---
// 1. neverthrow knows the functions that might
// error, and those that won't.
const mightError = safeTry(function* () {
  if (Math.random() > 0.5) {
    yield* err("Error here!" as const).safeUnwrap();
  }

  return ok("Success!" as const);
});

// 2. Here, error is 'Error here!'.
console.log(mightError);
//          ^?
```

```ts twoslash
import { err, ok, safeTry } from "neverthrow";

// ---cut---
const wontError = safeTry(function* () {
  return ok("Success!" as const);
});

// 3. But here, it's never.
console.log(wontError);
//          ^?
```
