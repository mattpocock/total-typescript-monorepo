# Generics Cheat Sheet

## Generic Types

### Using Generic Types

`Promise`, `Record` and `Array` are all examples of generic types.

```ts
type StringArray = Array<string>;
const strings: StringArray = ["a", "b", "c"];

type PromiseResolvingToNumber = Promise<number>;

type RecordOfStrings = Record<string, string>;
const record: RecordOfStrings = { a: "a", b: "b", c: "c" };
```

### Utility Types

Utility types, like `Pick` and `Omit`, are generic types.

```ts
type Person = { name: string; age: number; location: string };

type PersonWithOnlyName = Pick<Person, "name">;
type PersonWithoutName = Omit<Person, "name">;
```

### Create Your Own Generic Type

You can create your own generic types by adding a type parameter.

```ts
type Maybe<T> = T | null | undefined;

type MaybeString = Maybe<string>;
```

### Generic Interfaces

Interfaces can also be generic:

```ts
interface Box<T> {
  value: T;
}

const box: Box<string> = { value: "hello" };
```

### Generic Types Vs Normal Types

Generic types have type parameters, while normal types do not. That's the only difference.

```ts
type NormalType = string;

type GenericType<T> = T;
```

### Type Parameters vs Type Arguments

Type parameters are the declaration. Type arguments are the actual types you pass in.

```ts
type Box<T> = { value: T };
//       ^ Type parameter

const box: Box<string> = { value: "hello" };
//             ^^^^^^ Type argument
```

### Type Parameter Constraints

You can force users of your generic type to pass in a specific type.

```ts
type Box<T extends string> = { value: T };

type StringBox = Box<"abc">;

type NumberBox = Box<123>; // Error
```

### Generic Types MUST Receive All Type Arguments

You must pass in all type arguments when using a generic type.

```ts
type Box<T> = { value: T };

type StringBox = Box<string>; // OK
type NumberBox = Box; // Error
```

### Default Type Parameters

You can provide default type parameters for your generic types.

```ts
type Box<T = number> = { value: T };

type StringBox = Box<string>;
type NumberBox = Box;
```

## Generic Functions

### Passing Types To Generic Functions

Generic functions can receive type arguments as well as runtime arguments.

```ts
const set = new Set<number>([1, 2, 3]);
//                  ^^^^^^  ^^^^^^^^^
//                   type     value
```

### Non-Generic Functions

Not all functions can receive type arguments:

```ts
const obj = JSON.parse<{ hello: string }>('{"hello": "world"}');
//                     ^^^^^^^^^^^^^^^^^
//                     Expected 0 type arguments, but got 1.
```

### Declaring Your Own Generic Functions

Just like generic types, generic functions declare type parameters.

```ts
function first<T>(arr: T[]) {
  //           ^ Type parameter
  return arr[0];
}
```

### Generic Functions Vs Normal Functions

Generic functions have type parameters, while normal functions do not.

```ts
// Normal function
function first(arr: string[]) {
  return arr[0];
}

// Generic function
function genericFirst<T>(arr: T[]) {
  return arr[0];
}
```

### Type Arguments Vs Runtime Arguments

When you pass a type argument, it forces the runtime arguments to match.

```ts
const firstNumber = first<number>([1, 2, 3]);


### Inferring From Runtime Arguments

When you pass a
```
