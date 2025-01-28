In `TypeScript` 5.8, a new flag is dropping. It's called `erasableSyntaxOnly`.

It disables a bunch of features that I don't think should ever have been part of `TypeScript`.

Let's talk about it.

## What Does `erasableSyntaxOnly` Do?

`erasableSyntaxOnly` marks enums, namespaces and class parameter properties as errors. These pieces of syntax are not considered erasable.

So the code below would result in three errors:

```ts
// Error! Not allowed
enum Example {
  foo,
}

// Error! Not allowed
namespace OhNo {
  export const foo = 1;
}

class X {
  // Error! Not allowed
  constructor(private foo: string) {}
}
```

## Why Is `erasableSyntaxOnly` Being Added?

Node's recent [TypeScript support](https://www.totaltypescript.com/typescript-is-coming-to-node-23), by default, doesn't support these features.

So turning on `erasableSyntaxOnly` is a really good option there.

But I think the TypeScript team is looking toward a future where these syntaxes will no longer be used.

There are several proposals floating to add types to JavaScript. One of the most popular is [types as comments](https://tc39.es/proposal-type-annotations/), which would allow JavaScript to treat types in code as ignorable at runtime.

This would mean that the following code would be valid JavaScript:

```ts twoslash
const x: number = 12;

const func = (a: number, b: number) => a + b;
```

This would be an enormous boon to the ecosystem, and bring us closer to TypeScript in the browser.

But the issue here is that some features just don't work in this model. And those features happen to be the same ones that `erasableSyntaxOnly` disables.

## When Will This Land?

This is slated to launch in TypeScript 5.8, which is due pretty soon.

You can try it right now on the [TypeScript playground](https://www.typescriptlang.org/play/?erasableSyntaxOnly=true&ts=5.8.0-dev.20250124#code/KYOwrgtgBAogHgQwgBwDbCgbwFBT1AdwHsDsBfIA). Enjoy!
