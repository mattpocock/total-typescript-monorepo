```ts twoslash
declare function myFunc(constraint: {
  requiredProp: string;
}): void;

const objWithExcessProperty = {
  requiredProp: "bar",
  excessProp: "I should error!",
};

myFunc(objWithExcessProperty); // No error!
```
