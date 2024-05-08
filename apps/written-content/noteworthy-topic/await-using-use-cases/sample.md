```typescript
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

  // Do stuff with connection
}
// Automatically closed after the function is called!
```
