```ts !!
import { err, ok, safeTry } from "neverthrow";

// 1. First, let's create a function that might
// fail randomly.
const mightFail = () => {
  if (Math.random() > 0.5) {
    // 2. If it succeeds, we return 'ok'
    return ok("It worked!");
  }
  // 3. If it fails, we return 'err'
  return err("It failed!");
};
```

```ts !!
import { err, ok, safeTry } from "neverthrow";

const mightFail = () => {
  if (Math.random() > 0.5) {
    return ok("It worked!");
  }
  return err("It failed!");
};

// 4. Next, let's try running this code with safeTry.
const result = safeTry(async function* () {
  const safeResult1 = yield* mightFail().safeUnwrap();

  return ok(safeResult1);
});
```

```ts !!
import { err, ok, safeTry } from "neverthrow";

const mightFail = () => {
  if (Math.random() > 0.5) {
    return ok("It worked!");
  }
  return err("It failed!");
};

// 4. Next, let's try running this code with safeTry.
const result = safeTry(async function* () {
  const safeResult1 = yield* mightFail().safeUnwrap();

  return ok(safeResult1);
});
```

```ts !!
import { err, ok, safeTry } from "neverthrow";

const mightFail = () => {
  if (Math.random() > 0.5) {
    return ok("It worked!");
  }
  return err("It failed!");
};

safeTry(async function* () {
  const safeResult1 = yield* mightFail();
  const safeResult2 = yield* mightFail();
  const safeResult3 = yield* mightFail();
  const safeResult4 = yield* mightFail();
  const safeResult5 = yield* mightFail();

  return ok(safeResult5);
});
```
