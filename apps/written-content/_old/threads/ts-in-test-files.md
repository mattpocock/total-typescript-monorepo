TypeScript sucks inside .test.ts files.

Here's an idea for a little abstraction that might help.

```typescript
describe("getUserId", () => {
  it("Should extract the user id", () => {
    const demoUser = {
      id: "123",
    };
    expect(
      // Ugh, I have to use 'as' again?!
      getUserId(demoUser as HugeUserType)
    ).toEqual("123");
  });
});
```

---

In your application code, you should care a LOT about the errors that TypeScript gives you.

They're usually pointing out bugs, syntax errors, or even logical errors.

---

But in your test code, TypeScript often just gets in the way.

If you're testing functions which take in large objects
