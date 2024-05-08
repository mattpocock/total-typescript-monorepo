TypeScript 5.2 has recently been released, and the team is already hard at work on TypeScript 5.3.

## Definitely Coming

**September 21st Update:** I've been checking some of the PR's in the TS repo, and two really nice improvements have landed.

### `readonly` no longer required when checking if arrays satisfy `as const`

In TypeScript 5.2, this code would throw an error:

> Type 'readonly []' does not satisfy the expected type 'string[]'.

```ts
const array = [] as const satisfies string[];
// Type 'readonly []' does not satisfy the expected type 'string[]'.
```

This would go away if you added a `readonly` modifier to `string[]`:

```ts twoslash
const array = [] as const satisfies readonly string[];
```

But this is a bit annoying. Since we're already specifying `as const`, it feels redundant to also add `readonly`.

Fortunately, in TypeScript 5.3 this error will no longer occur - it'll _just work_ - thanks to [this PR](https://github.com/microsoft/TypeScript/pull/55229).

### `switch(true)` will be narrowed properly

`switch(true)` is a popular way to express complicated if/else in TypeScript. It lets you achieve a pattern-matching-like syntax:

```ts
function getNodeDescriptionSwitch(node: Node) {
  switch (true) {
    case isArrayLiteralExpression(node):
    case isObjectLiteralExpression(node):
      return "Array or object";
    case isBigIntLiteral(node):
    case isNumericLiteral(node):
      return "Numberish";
    case isNoSubstitutionTemplateLiteral(node):
    case isRegularExpressionLiteral(node):
    case isStringLiteral(node):
    case isTemplateLiteral(node):
      return "Stringlike";
    default:
      return "Some sort of node";
  }
}
```

The unfortunate thing about this pattern is that TypeScript _wouldn't do any narrowing_ in the `case` statements.

```ts
function handleStringOrNumber(value: string | number) {
  switch (true) {
    case typeof value === "string":
      // Error: value is still string | number
      return value.toUpperCase();
    case typeof value === "number":
      // Error: value is still string | number
      return value.toFixed(2);
  }
}
```

In TypeScript 5.3, this will now just work out of the box, thanks to [this PR](https://github.com/microsoft/TypeScript/pull/53681) from [AndaristRake](https://twitter.com/AndaristRake).

## Maybe Coming

The TypeScript team has recently posted the [TypeScript 5.3 Iteration Plan](https://github.com/microsoft/TypeScript/issues/55486), the document they use to plan out what features might be in the next version of TypeScript.

The iteration plan is a great way to get a sneak peek at what's coming in TypeScript 5.3. It's not a guarantee that these features will land - but it's a good indication.

So - here are the most interesting features that _might_ land in TS 5.3.

### Import Attributes

TypeScript 5.3 might implement [Import Attributes](https://github.com/tc39/proposal-import-attributes), a TC39 proposal that recently reached Stage 3.

Import Attributes allow you to specify options for imports. For example, you can specify the type of a JSON import:

```ts
import json from './foo.json' with { type: 'json' };
```

It also lets you specify the type of a dynamic import:

```ts
import("foo.json", { with: { type: "json" } });
```

You can re-export a module with a validated type:

```ts
export { val } from './foo.js' with { type: "javascript" };
```

OR, instantiate a worker with a validated type:

```ts
new Worker("foo.wasm", {
  type: "module",
  with: { type: "webassembly" },
});
```

The motivation for this change is to provide JavaScript a way to validate what kinds of MIME types are being imported. The main reason is [security](https://github.com/tc39/proposal-import-attributes#motivation): "to prevent a scenario where the responding server unexpectedly provides a different MIME type, causing code to be unexpectedly executed".

### Supporting `throw` Expressions

One of the syntaxes that has been proposed for JavaScript is the `throw` expression. This is a way to throw an error without using a statement. For example, you could write:

```ts
const id = searchParams.id || throw new Error("id is required");
```

You might be surprised that this isn't available in JavaScript today - but it's not! It'll throw an error in TypeScript:

```ts twoslash
// @errors: 1109
declare const searchParams: {
  id?: string;
}
// ---cut---

const id = searchParams.id || throw new Error("id is required");
```

However, throw expressions are unlikely to land in TypeScript 5.3. The [proposal](https://github.com/tc39/proposal-throw-expressions) is still in Stage 2, a little way off the Stage 3 benchmark needed to add them to TypeScript.

But the TypeScript iteration plan makes specific mention of 'championing' this proposal. This means they're actively working on it, so it could land in a future version of JavaScript/TypeScript.

### Isolated Declarations

I was lucky enough to have the chance to go to the Bloomberg offices in London a few weeks ago to chat with [Titian](https://twitter.com/TitianCernicova), the author of this PR. I'm pretty excited about it.

In a monorepo with many packages, you might have packages that depend on each other. You could end up with an extremely deep, 'family tree'-like setup where package A depends on package B, which depends on package C, which depends on package D.

In these situations, TypeScript's checking can get pretty slow. Package D has to be checked first, then package C, then B, then A.

The reason for this is that printing declaration files (.d.ts files) for each package _has_ to be done by TypeScript itself - which also means type checking them. This is a slow process.

One way to speed this up would be to let a faster tool (like `esbuild` or `swc`) create the declaration files for each package. But this currently isn't possible. TypeScript is pretty loose about how few/many annotations you need to add to your code. Third-party tools aren't smart enough to generate declaration files based on inference.

Enter [Isolated Declarations](https://github.com/microsoft/TypeScript/pull/53463) - a new, stricter mode of TypeScript that solves this problem.

It's an option you can add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "isolatedDeclarations": true
  }
}
```

And when enabled, it'll force you to be stricter about adding annotations. The exact level of strictness is still being worked out and might change over time. But as an example, return type annotations on exported functions will likely be mandatory to save TypeScript from having to infer them.

Before you kick up a fuss (I'm on record saying how little I like [return type annotations](https://www.totaltypescript.com/tips/dont-use-return-types-unless)), you only need to enable `isolatedDeclarations` on shared packages - you won't need to enable it on your application code. The restrictions on shared packages will likely be desirable because in general you want to add more annotations to shared packages anyway.

A [recent demo by Titian and team](https://github.com/microsoft/TypeScript/pull/53463#issuecomment-1660720127) showed significant speedups for a large monorepo. I'm excited to see if this lands in TypeScript 5.3.

### Narrowing in Generic Functions

My one piece of advice when working with generic functions is "don't be afraid to use `as`". TypeScript, as it exists now, doesn't do a great job of narrowing inside generic functions.

Check out this example below.

```ts twoslash
// @errors: 2322
interface Example {
  foo: string;
  bar: number;
}

function exampleFunc<T extends keyof Example>(key: T): Example[T] {
  if (key === "foo") {
    return "abc";
  } else {
    return 123;
  }
}
```

Here, we're trying to return a value from an object based on a key. If we pass in 'foo', we're returning a string. If we pass in 'bar', we're returning a number.

But TypeScript is giving an error, despite this code appearing to be valid.

The reason this doesn't happen is that TypeScript isn't _narrowing_ `Example[T]` to be the correct key. Any narrowing applied to `Example[T]` will end up in it being typed as `never` - hence the errors above.

The only current way to get this working is to type it `as never`:

```ts twoslash
interface Example {
  foo: string;
  bar: number;
}

// ---cut---

function exampleFunc<T extends keyof Example>(key: T): Example[T] {
  if (key === "foo") {
    return "abc" as never;
  } else {
    return 123 as never;
  }
}
```

Which feels really, really bad.

TypeScript 5.3 _might_ ship some changes here. There's a [long-open issue](https://github.com/microsoft/TypeScript/issues/33014) that details exactly the motivations for this change.

This might be the thing I'm most excited about - the bad inference here is a huge barrier to people experimenting with generics. If TypeScript were smarter in these situations, it would make my job teaching generics a lot easier.

### Automatic Loose Autocomplete on strings

There's a famous hack with TypeScript where you can use a `string & {}` to get 'loose autocomplete' on a string. For example:

```ts twoslash
type IconSize = "small" | "medium" | "large" | (string & {});
```

This annotation might look strange - but the reason it exists is so that you can pass _anything_ to `IconSize` while ALSO getting autocomplete for the three other values.

```ts twoslash
type IconSize = "small" | "medium" | "large" | (string & {});

// ---cut---

const icons: IconSize[] = [
  "small",
  "medium",
  "large",
  "extra-large",
  "anything-goes",
];
```

TypeScript 5.3 might ship a new feature that makes this hack unnecessary. You'll be able to use `string` as a type and get the same autocomplete:

```ts twoslash
type IconSize = "small" | "medium" | "large" | string;
```

This would be extremely welcome - especially because Webstorm users have had this for years.

### `fetch` in `@types/node`

On February 1st, 2022, the Node.js team merged a pull request to add the Fetch API to Node.js. This means that Node.js will have a `fetch` function, just like the browser.

The trouble is, this hasn't yet been added to `@types/node`. This papercut has resulted in a relatively heated back-and-forth on a [DefinitelyTyped issue](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924).

So, it's useful that the TypeScript team might be stepping in to take a look at it.
