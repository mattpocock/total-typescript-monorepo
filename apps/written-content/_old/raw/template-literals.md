### More Examples of Template Literal Types

We can create many variations of the `Example` type to showcase the power of template literal types. Some such examples are:

#### Example 1: Pluralize a string

```typescript
type Pluralize<T extends string> = `${T}s`;

type Result = Pluralize<"apple">; // "apples"
```

The `Pluralize` type takes a string and returns the same string with an "s" at the end.

#### Example 2: Build URLs

```typescript
type Url<Endpoint extends string> =
  `https://example.com/api/${Endpoint}`;

type Result = Url<"users">; // "https://example.com/api/users"
```

The `Url` type takes an endpoint string and returns a URL by appending it to a base URL.

#### Example 3: Combine paths

```typescript
type PathCombine<
  Prefix extends string,
  Suffix extends string
> = `${Prefix}/${Suffix}`;

type Result = PathCombine<
  "https://example.com/api",
  "users"
>; // "https://example.com/api/users"
```

The `PathCombine` type takes a prefix string and a suffix string and returns them combined with a "/" separator.

### More Examples of Generics

Generics are a powerful feature of TypeScript that allow us to write functions and classes that work with a variety of types. Here are some interesting use cases:

#### Example 1: Create a "pluck" function

```typescript
function pluck<T, K extends keyof T>(
  arr: T[],
  key: K
): T[K][] {
  return arr.map((item) => item[key]);
}

const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 40 },
];
const names = pluck(users, "name"); // ["Alice", "Bob"]
```

The `pluck` function takes an array of objects and a key to select for each object. It returns an array of the values of that key for each object.

#### Example 2: Add fields to an object

```typescript
function addFields<
  T extends object,
  U extends object
>(obj: T, fields: U): T & U {
  return { ...obj, ...fields };
}

const user = { name: "Alice", age: 30 };
const extendedUser = addFields(user, {
  isAdmin: false,
}); // { name: "Alice", age: 30, isAdmin: false }
```

The `addFields` function takes two objects and returns a new object with the fields of both objects merged.

#### Example 3: Create a "unique" function for arrays

```typescript
function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

const numbers = [1, 2, 2, 3];
const uniqueNumbers = unique(numbers); // [1, 2, 3]
```

The `unique` function takes an array of values and returns a new array with only the unique values. It does this by converting the array to a `Set` and then back to an array.
