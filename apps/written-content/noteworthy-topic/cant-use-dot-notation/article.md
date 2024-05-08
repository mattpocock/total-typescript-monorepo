In TypeScript, it's common to feel frustration that you can't use dot notation to access type properties.

```ts twoslash
// @errors: 2713
type Person = {
  name: string;
  age: number;
};

type Name = Person.name;
```

But there are several good reasons the TypeScript team hasn't implemented it.

## Quick Explanation

- Square bracket notation can do everything that dot notation can do, and more:

```ts twoslash
type Person = {
  name: string;
  age: number;
};

type Name = Person["name"];
//   ^?

type AllValues = Person["name" | "age"];
//   ^?
```

- The TypeScript team is unlikely to add new syntax for a feature that's already possible another way.

## Full Explanation

You're used to two different syntaxes in JavaScript for accessing property values:

```ts twoslash
// @moduleDetection: force
const person = {
  name: "Ada",
  age: 42,
};

// Dots
const name = person.name;

// Square brackets
const age = person["age"];
```

So why does TypeScript only allow the _second_ syntax?

```ts twoslash
// @errors: 2713
type Person = {
  name: string;
  age: number;
};

type PersonName = Person.name;

type PersonAge = Person["age"];
```

### TypeScript Namespaces

The error discovered above is usefully phrased.

> 'Person' is a type, but not a namespace.

TypeScript namespaces are a way of grouping together types and values into a single spot.

And unlike types, they allow you to use the dot notation OR square bracket notation to access their members.

```ts twoslash
namespace MyMath {
  export const PI = 3.14;

  export type Vector = {
    x: number;
    y: number;
  };
}

const pi = MyMath["PI"];

type Vector = MyMath.Vector;
```

Namespaces are, in general, out of favor. They were brought in as a potential solution to 'modules' in JavaScript before ES Modules came along - so they're a legacy feature.

Namespaces also compile to runtime code. The code above will end up looking like this:

```ts
var MyMath;

(function (MyMath) {
  MyMath.PI = 3.14;
})(MyMath || (MyMath = {}));

const pi = MyMath["PI"];
```

So - namespaces are really just objects, and objects can be accessed with dot notation or square bracket notation.

All this to say - we now understand the error we were getting before. But why is it happening in the first place?

### What makes types different?

Let's take another look at our property access syntax:

```ts twoslash
type Person = {
  name: string;
  age: number;
};

type Name = Person["name"];
```

It's important to remember that this wasn't always available in TypeScript.

Specifically, it's called [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#keyof-and-lookup-types), and it landed in TypeScript 2.1 in 2016.

When the TypeScript team ships a new feature, they tend towards _minimum syntactical impact_. In other words - the fewest possible syntaxes for doing the same thing.

So, when they added the ability to access properties on types, they only chose one syntax - square bracket notation.

### Why not both?

Square bracket notation is _far_ more flexible than dot notation. For example, it lets you accept unions:

```ts twoslash
type Person = {
  name: string;
  age: number;
};

type Values = Person["name" | "age"];
//   ^?
```

Or even another type - perhaps extracted from the target itself. A popular pattern is to pass `keyof` to an indexed access type:

```ts twoslash
type Person = {
  name: string;
  age: number;
};

// ---cut---

// Simple Object values!
type Values2 = Person[keyof Person];
//   ^?
```

A version of this with dot notation would be hard to imagine:

```ts
type Person = {
  name: string;
  age: number;
};

// Bleugh
type Values = Person.(keyof Person);
```

So - the TypeScript team chose the most flexible syntax and left it at that.

### Will we ever get dot notation for types?

The TypeScript team is very careful about adding new syntax to the language, and they're unlikely to add new syntax for a feature that's already possible.

[Remco Haszing](https://twitter.com/remcohaszing) on Twitter also pointed out that bringing in this syntax would conflict with the namespace syntax:

TypeScript lets you declare an interface with the same name as a namespace - meaning the access notation acts as a differentiator between the type and the namespace.

```ts twoslash
namespace MyMath {
  export type PI = 3.14;
}

interface MyMath {
  PI: number;
}

// Resolves to the type
type Pi = MyMath["PI"];
//   ^?

// Resolves to the namespace
type Pi2 = MyMath.PI;
//   ^?
```

Gross - but this is the kind of thing that the TypeScript team has to consider when adding new syntax.

So, it's highly unlikely. We'll be stuck with our square bracket notation for a while yet.
