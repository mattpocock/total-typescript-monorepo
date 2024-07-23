```ts twoslash
type MightFailResult = {
  example: string;
};
declare function mightFail(): MightFailResult;

// ---cut---
// 1. Define an un-typed let:
let result;

try {
  // 2. Assign it if the function
  // doesn't throw:
  result = mightFail();
} catch (error) {
  // 3. Handle the error, either
  // by re-throwing or returning
  throw error;
}

// 4. The result is inferred from
// the return type of the function!
console.log(result);
//          ^?
```
