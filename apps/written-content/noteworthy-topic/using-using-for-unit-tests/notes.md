```ts
const mockSomething = () => {
  // Mock the thing in here!
  const myMock = "something";

  return {
    [Symbol.dispose]: () => {
      // Dispose of the mock in here!
    },
    value: myMock,
  };
};

it("Should log to the console", () => {
  using mock = mockSomething();

  console.log(mock.value);

  // It gets automatically disposed each time!
});
```
