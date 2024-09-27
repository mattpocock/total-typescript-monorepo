```ts twoslash
// @errors: 2869 18048
declare const exerciseThatMayNotExist:
  | { order: number }
  | undefined;

// ---cut---
// Fixed!
const example = exerciseThatMayNotExist
  ? exerciseThatMayNotExist.order + 1
  : 0;
```
