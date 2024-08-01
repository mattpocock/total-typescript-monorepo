```ts twoslash
// @noErrors
const getConnection = async () => {
  const connection = await getDb();

  return {
    connection,
    [Symbol.asyncDispose]: async () => {
      await connection.close();
    },
  };
};

async function main() {
  await using { connection } = getConnection();
}
```
