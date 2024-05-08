Need to manually type a JSON file?

I learned today that you can add a `.d.json.ts` file to manually assign a type to a JSON import.

For example, if you have a `data.json` file, you can create a `data.d.json.ts` file and define the type inside:

```ts
// data.d.json.ts
const data: Record<string, string>;

export default data;
```

You can change the `Record<string, string>` type to match the desired shape.

To make TypeScript recognize `.d.json.ts` files, you need to add a setting in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "allowArbitraryExtensions": true
  }
}
```

This setting lets TypeScript use `.d.json.ts` files.

## Why Would You Do This?

This technique can be particularly useful when working with large `.json` files used for test fixtures. If TypeScript infers the type of all the data in the file, it can significantly slow down the TypeScript transpilation process - and your IDE.

By assigning a broader type like `Record<string, string>`, TypeScript will use the specified type instead. This optimization can greatly improve the performance of your TypeScript transpilation.
