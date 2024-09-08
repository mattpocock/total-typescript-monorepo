There are several ways of typing an array of objects in TypeScript.

Here's a quick guide:

```ts twoslash
// 1. Inline
type WithBrackets = {
  status: number;
  body: string;
}[];
type WithHelper = Array<{
  status: number;
  body: string;
}>;
```

```ts twoslash
// 2. Type alias
type Response = {
  status: number;
  body: string;
};

type WithBrackets = Response[];
type WithHelper = Array<Response>;
```

```ts twoslash
// 3. Interface
interface Response {
  status: number;
  body: string;
}

type WithBrackets = Response[];
type WithHelper = Array<Response>;
```

## Inline Objects

You can define an array of objects inline by suffixing the object type with square brackets:

```ts twoslash
type WithBrackets = {
  status: number;
  body: string;
}[];
```

Or by using the `Array` helper:

```ts twoslash
type WithHelper = Array<{
  status: number;
  body: string;
}>;
```

## Type Alias

You can define a type alias for the object type and then use it to define the array type:

```ts twoslash
type Response = {
  status: number;
  body: string;
};

type WithBrackets = Response[];
type WithHelper = Array<Response>;
```

## Interface

You can define an interface for the object type and then use it to define the array type:

```ts twoslash
interface Response {
  status: number;
  body: string;
}

type WithBrackets = Response[];
type WithHelper = Array<Response>;
```

## Helper Or Brackets?

It doesn't really matter whether you use the square brackets or the `Array` helper to define an array of objects in TypeScript. Both methods are valid and produce the same result.

I have a more [in-depth guide](https://www.totaltypescript.com/array-types-in-typescript), but this knowledge won't be needed for beginners.

## Type, Interface, Or Inline?

Type or interface is an interesting debate which I've [written about before](https://www.totaltypescript.com/type-vs-interface-which-should-you-use). For declaring simple object types, it doesn't matter which you use.

The better question is whether you should define the object type inline or separately (using type or interface). I tend to prefer defining the object type separately. If I'm using an array type, I'll probably need to access the type of that array at some point. So, defining the object type separately makes it easier to reuse.

But if you want a quick and dirty solution, defining the object type inline is perfectly fine.

## Going Deeper

If you're just starting out on your TypeScript journey, my free book is an extremely good place to start.

Here's the [section on arrays](https://www.totaltypescript.com/books/total-typescript-essentials/essential-types-and-annotations#arrays-and-tuples). Enjoy!
