Every TypeScript project ships with a standard library of utility types. These types are globally available - no imports required - and make writing type-level code easier.

I've sorted this guide into categories based on the types' use cases. Each section contains a brief explanation of the type, followed by a code example in a TypeScript playground.

I've also tried to include some common gotchas and edge cases for each type.

# Objects

Most things in TypeScript are objects, so it makes sense that TypeScript ships several utility types for working with them.

## `Partial`

- **Receives**: an object
- **Returns**: object with all properties made optional
- Opposite of [`Required`](#required)

Try it out in the playground below:

<Editor>

```typescript
type User = {
  name: string;
  age: number;
};

type PartialUser = Partial<User>;

const user1: PartialUser = {
  name: "Alice",
};

const user2: PartialUser = {
  age: 30,
};

const user3: PartialUser = {};
```

</Editor>

### `Partial` preserves readonly properties

`Partial` preserves the `readonly` modifier on properties.

```ts twoslash
type User = {
  readonly name: string;
  age: number;
};

type PartialUser = Partial<User>;
//   ^?
```

### `Partial` works on unions of objects

Unlike [`Pick`](#omit) and [`Omit`](#pick), `Partial` works on unions of objects.

In the example below, we can see that `Partial` makes all properties optional in the union.

```ts twoslash
type ClickEvent = {
  type: "click";
  x: number;
  y: number;
};

type HoverEvent = {
  type: "hover";
  x: number;
  y: number;
};

type Event = ClickEvent | HoverEvent;

type PartialEvent = Partial<Event>;
//   ^?
```

### `Partial` with `exactOptionalPropertyTypes`

When you have `exactOptionalPropertyTypes` enabled, `Partial` will make all properties optional and not allow `undefined` to be passed as a value.

```ts twoslash
// @errors: 2375
// @exactOptionalPropertyTypes
type User = {
  name: string;
  age: number;
};

type PartialUser = Partial<User>;
//   ^?

const user1: PartialUser = {
  name: undefined,
};
```

## `Required`

- **Receives**: an object
- **Returns**: object with all properties non-optional
- Opposite of [`Partial`](#partial)

Try it out in the playground below:

<Editor>

```typescript
type PartialUser = {
  name?: string;
  age?: number;
};

type RequiredUser = Required<PartialUser>;

const user1: RequiredUser = {
  name: "Matt",
};
```

</Editor>

### `Required` works on unions of objects

Just like [`Partial`](#partial), `Required` works on unions of objects.

```ts twoslash
type ClickEvent = {
  type: "click";
  x?: number;
  y?: number;
};

type HoverEvent = {
  type: "hover";
  x?: number;
  y?: number;
};

type Event = ClickEvent | HoverEvent;

type RequiredEvent = Required<Event>;
//   ^?
```

## `Readonly`

- **Receives**: an object
- **Returns**: object with all properties readonly
- Oddly, there is no opposite of `Readonly`

Try it out in the playground below:

<Editor>

```typescript
type User = {
  name: string;
  age: number;
};

type ReadonlyUser = Readonly<User>;

const user: ReadonlyUser = {
  name: "Matt",
  age: 30,
};

user.name = "Alice";
```

</Editor>

### `Readonly` works on unions of objects

Just like [`Partial`](#partial) and [`Required`](#required), `Readonly` works on unions of objects.

```ts twoslash
type ClickEvent = {
  type: "click";
  x: number;
  y: number;
};

type HoverEvent = {
  type: "hover";
  x: number;
  y: number;
};

type Event = ClickEvent | HoverEvent;

type ReadonlyEvent = Readonly<Event>;
//   ^?
```

### Creating A `Mutable` Type

To create a type that is the opposite of `Readonly`, you can use the following type:

```ts twoslash
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
```

This type removes the `readonly` modifier from all properties in an object. Like `Readonly`, it works on unions of objects.

Try it out in the playground below:

<Editor>

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type User = {
  readonly name: string;
  readonly age: number;
};

type MutableUser = Mutable<User>;

const user: MutableUser = {
  name: "Matt",
  age: 30,
};

user.name = "Alice";
```

</Editor>

## `Record`

- **Receives**: a set of keys and a type
- **Returns**: an object with the keys as properties and the type as the value

Try it out in the playground below:

<Editor>

```typescript
type StringRecord = Record<string, string>;

const readableNames: StringRecord = {
  math: "Mathematics",
  sci: "Science",
};
```

</Editor>

### `Record` With Literal Keys

You can use literal types as keys in `Record`.

```ts twoslash
type Environment = "development" | "production";

type Config = Record<Environment, string>;

const config: Config = {
  development: "http://localhost:3000",
  production: "https://example.com",
};
```

This makes it slightly more flexible than index signatures, which don't allow literals as keys:

```ts twoslash
// @errors: 1337
type Environment = "development" | "production";

type Config = {
  [key: Environment]: string;
};
```

You'd need to use a mapped type instead (which is what `Record` does under the hood):

```ts twoslash
type Environment = "development" | "production";

type Config = {
  [K in Environment]: string;
};

type Example = Config;
//             ^?
```

## `Pick`

- **Receives**: an object and a union of keys to pick
- **Returns**: object with only the picked keys
- Opposite of [`Omit`](#omit)
- Often confused with [`Extract`](#extract). `Pick` picks keys from objects, `Extract` picks members from unions.

Try it out in the playground below:

<Editor>

```typescript
type User = {
  name: string;
  age: number;
  email: string;
};

type OnlyNameAndAge = Pick<User, "name" | "age">;

const user: OnlyNameAndAge = {
  name: "Matt",
  age: 30,
  email: "abc@example.com",
};
```

</Editor>

## `Omit`

- **Receives**: an object and a union of keys to omit
- **Returns**: object with all keys except the omitted ones
- Opposite of [`Pick`](#pick)
- Often confused with [`Exclude`](#exclude). `Omit` omits keys from objects, `Exclude` removes members from unions.

Try it out in the playground below:

<Editor>

```typescript
type User = {
  name: string;
  age: number;
  email: string;
};

type WithoutEmail = Omit<User, "email">;

const user: WithoutEmail = {
  name: "Matt",
  age: 30,
  email: "abc@example.com",
};
```

</Editor>

### `Omit` doesn't work on unions of objects

Unlike [`Partial`](#partial), [`Required`](#required), and [`Readonly`](#readonly), `Omit` doesn't work on unions of objects.

```ts twoslash
type ClickEvent = {
  type: "click";
  element: HTMLElement;
};

type HoverEvent = {
  type: "hover";
  x: number;
  y: number;
};

type Event = ClickEvent | HoverEvent;

type WithoutElement = Omit<Event, "element">;
//   ^?
```

For more information on this, check out [my book](/books/total-typescript-essentials/objects#omit-and-pick-dont-work-well-with-union-types).

### `Omit` is looser than `Pick`

`Omit` is looser than [`Pick`](#pick) in that it allows you to omit keys that don't exist on the object.

```ts twoslash
type User = {
  name: string;
  age: number;
};

type WithoutEmail = Omit<User, "does-not-exist">;
```

This is a deliberate design decision from the TypeScript team. For more information, check out [my book](/books/total-typescript-essentials/objects#omit-is-looser-than-pick).

# Unions

## `Exclude`

TODO

## `Extract`

TODO

## `NonNullable`

TODO

# Functions

## `Parameters`

TODO

## `ReturnType`

TODO

# Classes

## `ConstructorParameters`

TODO

## `InstanceType`

TODO

# `this`

## `ThisParameterType`

TODO

## `OmitThisParameter`

TODO

## `ThisType`

TODO

# Generic Functions

## `NoInfer`

TODO

# Promises

## `Awaited`

TODO

# Strings

## `Uppercase`

TODO

## `Lowercase`

TODO

## `Capitalize`

TODO

## `Uncapitalize`

TODO
