# TypeScript 5.2's New Keyword: 'using'

TypeScript 5.2 will introduce a new keyword - 'using' - that you can use to dispose of anything with a `Symbol.dispose` function when it leaves scope.

```typescript
{
  const getResource = () => {
    return {
      [Symbol.dispose]: () => {
        console.log('Hooray!')
      }
    }
  }

  using resource = getResource();
} // 'Hooray!' logged to console
```

This is based on the [TC39 proposal](https://github.com/tc39/proposal-explicit-resource-management), which recently reached Stage 3, indicating that it is coming to JavaScript.

`using` will be extremely useful for managing resources like file handles, database connections, and more.

## `Symbol.dispose`

The `Symbol.dispose` function is a new symbol that will be added to the global symbol registry. Anything with a `Symbol.dispose` function will be considered a 'resource' - ["an object with a specific lifetime"](https://github.com/tc39/proposal-explicit-resource-management#definitions) - and can be used with the `using` keyword.

```typescript
const resource = {
  [Symbol.dispose]: () => {
    console.log("Hooray!");
  },
};
```

## `await using`

You can also use `Symbol.asyncDispose` and `await using` to handle resources which need to be disposed asynchronously.

```typescript
const getResource = () => ({
  [Symbol.asyncDispose]: async () => {
    await someAsyncFunc();
  },
});

{
  await using resource = getResource();
}
```

This will await the `Symbol.asyncDispose` function before continuing.

This will be useful for resources such as database connections, where you want to ensure that the connection is closed before the program continues.

## Use cases

### File handles

Accessing the file system via file handlers in node could be a lot easier with `using`.

Without `using`:

```typescript
import { open } from "node:fs/promises";

let filehandle;
try {
  filehandle = await open("thefile.txt", "r");
} finally {
  await filehandle?.close();
}
```

With `using`:

```typescript
import { open } from "node:fs/promises";

const getFileHandle = async (path: string) => {
  const filehandle = await open(path, "r");

  return {
    filehandle,
    [Symbol.asyncDispose]: async () => {
      await filehandle.close();
    },
  };
};

{
  await using file = getFileHandle("thefile.txt");

  // Do stuff with file.filehandle

} // Automatically disposed!
```

### Database connections

Managing database connections is a common use case for `using` in C#.

Without `using`:

```typescript
const connection = await getDb();

try {
  // Do stuff with connection
} finally {
  await connection.close();
}
```

With `using`:

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

{
  await using db = getConnection();

  // Do stuff with db.connection

} // Automatically closed!
```
