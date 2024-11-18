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
type Person = {
  name: string;
  age: number;
  location: string;
};

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

### Multiple Type Parameters

You can have multiple type parameters in a generic type.

```ts
type Result<T, E> = { value: T; error: E };
```

### Naming Type Parameters

By convention, type parameters are either a single letter or prefixed with `T`:

```ts
type Box<T> = { value: T };

type Result<TValue, TError> = {
  value: TValue;
  error: TError;
};
```

### Generic Types MUST Receive All Type Arguments

You must pass in all type arguments when using a generic type.

```ts
type Box<T> = { value: T };

type StringBox = Box<string>; // OK
type BadBox = Box; // Error
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

When you pass a type argument, it forces the runtime arguments to match it.

```ts
first<string>([1, 2, 3]);
//             ^^^^^^^ Error!

first<string>(["a", "b", "c"]); // OK

first<number>([1, 2, 3]); // OK
```

### Inferring From Runtime Arguments

When you don't pass a type argument, TypeScript infers it from the runtime arguments.

```ts
const firstElement1 = first([1, 2, 3]);
//    ^ number, inferred from [1, 2, 3]

const firstElement2 = first(["a", "b", "c"]);
//    ^ string, inferred from ["a", "b", "c"]

const firstElement3 = first([true, false]);
//    ^ boolean, inferred from [true, false]
```

### Type Parameters Constraints

You can constrain the type of the type parameter in a generic function, just like in a generic type.

```ts
function first<T extends string>(arr: T[]) {
  return arr[0];
}

first(["a", "b", "c"]); // OK
first([1, 2, 3]); // Error
```

### Unreferenced Type Paramaters

You can have type parameters that are not used in the function's arguments.

```ts
const createSet = <T>() => new Set<T>();
```

When no type argument is passed, they default to `unknown`.

```ts
const set = createSet();
//    ^ Set<unknown>
```

When there is a constraint, they default to the constraint.

```ts
const createSet = <T extends string>() => new Set<T>();

const stringSet = createSet();
//    ^ Set<string>
```

### Type Parameter Defaults

You can provide default type parameters for your generic functions.

```ts
const createSet = <T = number>() => new Set<T>();

const numberSet = createSet();
//    ^ Set<number>

const stringSet = createSet<string>();
//    ^ Set<string>
```

### No Partial Type Inference

If you pass one type argument to a function, you must pass all of them.

```ts
const map = <TInput, TOutput>(
  arr: TInput[],
  fn: (value: TInput) => TOutput,
) => arr.map(fn);

const idObjects = map<number>([1, 2, 3], (id) => ({ id }));
//                    ^^^^^^ Expected 2 type arguments.
```

### Generic Classes

Classes can also be generic:

```ts
class Box<T> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }
}

const box = new Box("hello");
//    ^ Box<string>
```

### Const Type Parameters

You can use `const` assertions to make generic function type parameters behave as if they were `as const`.

```ts
//             ↓↓↓↓ const type parameter
const first = <const T extends readonly any[]>(arr: T[]) =>
  arr[0];

const firstElement = first(["a", "b", "c"]);
//    ^ "a", instead of string
```
