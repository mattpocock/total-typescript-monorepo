```ts twoslash
declare const it: any;
declare const expect: any;

// ---cut---

// 1. Use 'declare' to design the API first
declare function functionToTest(arg: string): {
  foo: string;
};

// 2. Write your tests with full type safety!
it("Should return an object containing ", () => {
  const result = functionToTest("foo");

  expect(result.foo).toEqual("foo");
});
```
