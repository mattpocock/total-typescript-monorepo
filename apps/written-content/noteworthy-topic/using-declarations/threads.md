'using' is coming to TypeScript 5.2, and it's going to open SO many nice API's.

Let's take a look at a few imaginary API's that could be built with it.

🧵

```ts twoslash
declare const addUserToDb: () => Promise<string>;
declare const removeUserFromDb: (
  id: string
) => Promise<void>;
declare const it: (
  name: string,
  fn: () => Promise<void>
) => void;

// ---cut---
const setupTest = async () => {
  const userId = await addUserToDb();

  return {
    userId,
    [Symbol.dispose]: async () => {
      await removeUserFromDb(userId);
    },
  };
};

it('Should work', async () => {
  await using test = await setupTest();
  //          ^?

  // Automatically disposed - no more beforeEach!
})
```
