## Quick Explanation

- Interfaces can't express unions, mapped types, or conditional types. Type aliases can express any type.

- Interfaces can use `extends`, types can't.

- When you're working with objects that inherit from each other, use interfaces. `extends` makes TypeScript's type checker run slightly faster than using `&`.

- Interfaces with the same name in the same scope merge their declarations, leading to unexpected bugs.

- Type aliases have an implicit index signature of `Record<PropertyKey, unknown>`, which comes up occasionally.

## Full Explanation

TypeScript offers a first-class primitive for defining objects that extend from other objects - an `interface`.

Interfaces have been present since the very first version of TypeScript. They're inspired by object-oriented programming and allow you to use inheritance to create types:

```ts twoslash
// @errors: 2322
interface WithId {
  id: string;
}

interface User extends WithId {
  name: string;
}

const user: User = {
  id: "123",
  name: "Karl",
  wrongProperty: 123,
};
```

However, they come with a built-in alternative - type aliases, declared using the `type` keyword. The `type` keyword can be used to represent _any_ sort of type in TypeScript, not just object types.

Let's say we want to represent a type that is either a string or a number. We can't do that with an interface, but we can with a type:

```ts twoslash
// @errors: 2345
type StringOrNumber = string | number;

const func = (arg: StringOrNumber) => {};

func("hello");
func(123);

func(true);
```

But, of course, type aliases can also be used to express objects. This leads to a lot of debate among TypeScript users. When you're declaring an object type, should you use an interface or a type alias?

### Use Interfaces For Object Inheritance

If you're working with objects that inherit from each other, use interfaces. Our example above, using `WithId`, _can_ be expressed with type aliases, using an intersection type.

```ts twoslash
// @errors: 2322
type WithId = {
  id: string;
};

type User = WithId & {
  name: string;
};

const user: User = {
  id: "123",
  name: "Karl",
  wrongProperty: 123,
};
```

This is perfectly fine code, but it's slightly less optimal. The reason is to do with the speed at which TypeScript can check your types.

When you create an interface using `extends`, TypeScript can cache that interface by its name in an internal registry. This means that future checks against it can be made faster. With an intersection type using `&`, it can't cache it via the name - it has to compute it nearly every time.

It's a small optimization, but if the interface is used many times, it adds up. This is why the [TypeScript performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections) recommends using interfaces for object inheritance - and so do I.

However, I still don't recommend you use interfaces by default. Why?

### Interfaces Can Declaration Merge

Interfaces have another feature which, if you're not prepared for it, can seem very surprising.

When two interfaces with the same name are declared in the same scope, they merge their declarations.

```ts twoslash
// @errors: 2741
interface User {
  name: string;
}

interface User {
  id: string;
}

const user: User = {
  id: "123",
};
```

If you were to try this with types, it wouldn't work:

```ts twoslash
// @errors: 2300
type User = {
  name: string;
};

type User = {
  id: string;
};
```

This is intended behavior and a necessary language feature. It's used to model JavaScript libraries that modify global objects, like adding methods to `string` prototypes.

But if you're not prepared for this, it can lead to really confusing bugs.

If you want to avoid this, I recommend you add ESLint to your project and turn on the [`no-redeclare`](https://typescript-eslint.io/rules/no-redeclare/) rule.

### Index Signatures in Types vs Interfaces

Another difference between interfaces and types is a subtle one.

Type aliases have an implicit index signature, but interfaces don't. This means that they're assignable to types that have an index signature, but interfaces aren't. This can lead to errors like:

> Index signature for type 'string' is missing in type 'x'.

```ts twoslash
// @errors: 2322
interface KnownAttributes {
  x: number;
  y: number;
}

const knownAttributes: KnownAttributes = {
  x: 1,
  y: 2,
};

type RecordType = Record<string, number>;

const oi: RecordType = knownAttributes;
```

The reason this errors is that an interface _could_ later be extended. It might have a property added that doesn't match the key of `string` or the value of `number`.

You can fix this by adding an explicit index signature to your interface:

```ts twoslash
interface KnownAttributes {
  x: number;
  y: number;
  [index: string]: unknown; // new!
}
```

Or simply, changing it to use `type` instead:

```ts twoslash
type KnownAttributes = {
  x: number;
  y: number;
};

const knownAttributes: KnownAttributes = {
  x: 1,
  y: 2,
};

type RecordType = Record<string, number>;

const oi: RecordType = knownAttributes;
```

Isn't that strange!

### Default to `type`, not `interface`

The TypeScript documentation has a [great guide](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) on this. They cover each feature (although not the implicit index signature), but they reach a different conclusion than me.

They recommend you choose based on personal preference, which I agree with. The difference between `type` and `interface` is small enough that you'll be able to use either one without many problems.

But the TS team recommends you default to using `interface` and only use `type` when you need to.

I'd like to recommend the opposite. The features of declaration merging and implicit index signatures are surprising enough that they should scare you off using interfaces by default.

Interfaces are still my recommendation for object inheritance, but I'd recommend you use `type` by default. It's a little more flexible and a little less surprising.
