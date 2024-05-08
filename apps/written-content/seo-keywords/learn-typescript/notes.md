# How To Learn TypeScript in 2023

## Basics

### What Is TypeScript?

TypeScript is a set of tools that make writing JavaScript more pleasant.

The tools include:

- **The TypeScript Language**, written in `.ts` and `.tsx` files.
- **The TypeScript Compiler**, which turns TypeScript files into JavaScript files via the `tsc` CLI.
- **The TypeScript Language Server**, which powers the TypeScript experience in your IDE.

You can learn more on [TypeScript's Landing Page](https://www.typescriptlang.org/).

### What Do You Need To Install To Use TypeScript?

You'll need to install [Node.js](https://nodejs.org/en) in order to use TypeScript to its fullest potential. Choose the LTS version.

You'll also need a code editor. I recommend [VSCode](https://code.visualstudio.com/download).

### Why Would You Choose TypeScript Over JavaScript?

TypeScript makes your IDE more powerful. It gives you autocomplete, in-IDE errors, and many more powerful features.

```ts twoslash
// @errors: 2339
const user = {
  firstName: "Angela",
  lastName: "Davis",
  role: "Professor",
};

console.log(user.name);
```

It also means you're less likely to ship bugs. In 2019, AirBnB found that 38% of bugs they'd shipped to production could have been prevented by TypeScript. Watch [this talk](https://www.youtube.com/watch?v=P-J9Eg7hJwE) to learn more.

### Does TypeScript Work In The Browser?

TypeScript uses some syntax which isn't in native JavaScript. For example, TypeScript has a `type` keyword, which JavaScript does not.

Because browsers only understand JavaScript, they can't run TypeScript files.

This means that to use TypeScript on the web, you need to turn TypeScript files into JavaScript files before you can send them to the browser.

### How Do You Turn TypeScript Files Into JavaScript Files?

You can use the `tsc` CLI to compile TypeScript files into JavaScript files. You'll need to:

1. Install TypeScript on npm
2. Add a `tsconfig.json` file to your project (which tells TypeScript what to do)
3. Run `tsc` to compile your TypeScript files into JavaScript files

This [guide from VSCode](https://code.visualstudio.com/docs/typescript/typescript-compiling) will help you get started.

### How Do You Use TypeScript To Build Modern Frontend Apps?

If you want to build a frontend application, you should use a frontend framework. Almost any modern framework you choose _will_ support TypeScript out of the box.

If you're not sure which to choose, I recommend [Vite](https://vitejs.dev/guide/) as a great place to start.

Frameworks like `Vite` take the responsibility of turning `.ts` files into `.js` files - as well as LOTS of other things.

This means you don't need to run `tsc` manually. Take a look at Vite's [getting started guide](https://vitejs.dev/guide/) to learn more.

### How Do You Use TypeScript On CI?

Using TypeScript on CI is a great way to make sure your project is free of bugs. Once this is set up, your CI will fail if your project has any TypeScript errors.

[GitHub Actions](https://docs.github.com/en/actions/learn-github-actions) are a great way to try this out. But you can use TypeScript on any Linux-based, Windows-based or MacOS-based CI. Anywhere Node.js runs, you can use TypeScript.

## Essential Types

Let's take a look at the essential parts of TypeScript's type system first.

Before you continue, I recommend you read the [Basics section](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) of the TypeScript Handbook. This'll give you some good context for the rest of this section.

### How Do You Type A Function's Parameters?

The first thing I recommend you learn is how to add types to a function's parameters.

This lets you add types to this `greet` function:

```ts twoslash
function greet(name: string) {
  console.log(
    "Hello, " + name.toUpperCase() + "!!"
  );
}
```

The `greet` function will then _only_ be able to accept a `string` as its first argument:

```ts twoslash
// @errors: 2345
function greet(name: string) {
  console.log(
    "Hello, " + name.toUpperCase() + "!!"
  );
}

// ---cut---

greet(42);
```

Learn more in the [Parameter Type Annotations](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#parameter-type-annotations) section of the TypeScript handbook.

### What Are TypeScript's Basic Types?

TypeScript's basic types are `string`, `number`, `boolean` and `symbol`. These represent the basic primitives that make up the JavaScript language.

```ts twoslash
let example1: string = "Hello World!";
let example2: number = 42;
let example3: boolean = true;
let example4: symbol = Symbol();
```

Here, we're also assigning those types to variables. This means that TypeScript will _only_ allow us to assign a `string` to `example1`, a `number` to `example2`, and so on.

```ts twoslash
// @errors: 2322
let example1: string = "Hello World!";
let example2: number = 42;
let example3: boolean = true;
let example4: symbol = Symbol();

// ---cut---

example1 = 42;
```

The TypeScript handbook has more information on [strings, numbers and booleans](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#the-primitives-string-number-and-boolean). If you don't know what a Symbol is, head to [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol).

### How Do You Type The Return Value Of A Function?

You can also type the return value of a function. This lets you add types to this `greet` function:

```ts twoslash
function greet(name: string): string {
  return "Hello, " + name.toUpperCase() + "!!";
}
```

This will ensure that the `greet` function _always_ returns a `string`:

```ts twoslash
// @errors: 2322
function greet(name: string): string {
  return 123;
}
```

You can learn more from the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#return-type-annotations).

### How Do You Type Objects?

Next, you should look at object types. These let you describe the shape of an object.

```ts twoslash
function printCoord(pt: {
  x: number;
  y: number;
}) {
  console.log(
    "The coordinate's x value is " + pt.x
  );
  console.log(
    "The coordinate's y value is " + pt.y
  );
}
printCoord({ x: 3, y: 7 });
```

These are described in [TypeScript's handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types).

You should also look at how to make [properties of objects optional](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#optional-properties).

### How Do You Create A Reusable Type?

You might be thinking - what if I have a type that I want to use in multiple places? Do I have to write it out every time?

You can save types for later use using the `type` keyword:

```ts twoslash
type Point = {
  x: number;
  y: number;
};

function printCoord(pt: Point) {}
```

These are called [Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases).

### How Do You Type Arrays?

You can type arrays in two ways. Either using the `[]` syntax:

```ts twoslash
let example1: string[] = ["Hello World!"];
let example2: number[] = [42];
```

Or, by using the `Array<>` syntax:

```ts twoslash
let example1: Array<string> = ["Hello World!"];
let example2: Array<number> = [42];
```

The [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays) section, as well as [my article comparing the two](https://www.totaltypescript.com/array-types-in-typescript), will help you learn more.

### How Do You Type Tuples?

Tuples are arrays with a fixed length, where each element has a fixed type.

```ts twoslash
let example1: [string, number] = [
  "Hello World!",
  42,
];
```

You can learn more about them in the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types).

### How Do You Type Functions?

You can type functions using the `() => Type` syntax:

```ts twoslash
type MyFunction = () => string;

let example1: MyFunction = () => "Hello World!";
```

This is useful for typing callbacks passed to other functions:

```ts twoslash
function addEventListener(
  event: string,
  callback: () => void
) {
  document.addEventListener(event, callback);
}
```

You can learn more about [function types in the TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions).

### How Do You Type Sets and Maps?

You can type sets and maps using the `Set<Type>` and `Map<KeyType, ValueType>` syntax:

```ts twoslash
// @errors: 2345
let example1 = new Set<string>();

example1.add(42);

let example2 = new Map<string, number>();

example2.set("id", "abc");
```

This syntax lets you pass types to functions - an important idea that will come up later. Without these types, `Map` and `Set` wouldn't understand what types they should be.

```ts twoslash
let example1 = new Set();

// No error!
example1.add(42);

example1.add("abc");

let example2 = new Map();

// No error!
example2.set("id", "abc");
```

### How Do You Type Async Functions?

You can type async functions by using the `Promise<>` syntax:

```ts twoslash
async function getGreeting(): Promise<string> {
  return "Hello World!";
}
```

If you don't use a `Promise`, TypeScript will error:

```ts twoslash
// @errors: 1064
async function getGreeting(): string {
  return "Hello World!";
}
```

## Unions And Narrowing

### What Is A Union Type?

### What Is A Literal Type?

### How Do You Narrow A Type?

### What Is An "Evolving Any"?

### What Is A Discriminated Union?

## Objects And Interfaces

### What Is An Intersection Type?

### What Does `interface extends` Mean?

### Should You Use `interface` Or `type`?

### What Is An Index Signature?

### What Is The `PropertyKey` Type?

### What Is The `Record` Type?

### What Are The `Pick` and `Omit` Types?

### What Are the `Partial` and `Required` Types?
