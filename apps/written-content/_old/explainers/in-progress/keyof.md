# `keyof` in TypeScript

In TypeScript, `keyof` is used to obtain the keys of an object type as a union of string literals. Here's an example:

```typescript
interface Person {
  firstName: string;
  lastName: string;
  age: number;
}

type PersonKeys = keyof Person; // "firstName" | "lastName" | "age"
```

In this code, we use the `keyof` operator to create a `PersonKeys` type that is a union of string literal types for each property name of `Person`.

## `keyof` with Generics

<!-- TODO -->

`keyof` is useful when you need to access a property of an object dynamically, but you want to ensure type safety at the same time. For example, suppose you have an object that represents a user and you want to get their first name using a dynamic key. The first way you might think about would be to use `any`:

```typescript
const user = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
};

function getFirstName(user: any, key: string) {
  return user[key]; // type of user[key] is any
}

const firstName = getFirstName(user, "firstName"); // returns any
```

In this code, we define an object `user` with three properties. We then define a function `getFirstName` that takes an object and a key as arguments and returns the value of the corresponding property. However, because we don't know the type of the property at compile time, TypeScript infers the type of the return value as `any`, which is not type-safe.

With `keyof`, we can make this function type-safe:

```typescript
function getFirstName(
  user: Person,
  key: keyof Person
) {
  return user[key]; // type of user[key] is "Person[keyof Person]"
}

const firstName = getFirstName(user, "firstName"); // returns "John"
```

In this code, we define a function `getFirstName` that takes an object of type `Person` and a key of type `keyof Person`. By using `keyof`, we ensure that the key is only one of the keys defined in `Person`. TypeScript infers the type of the return value as `Person[keyof Person]`, which is equivalent to `string` in this case. This makes the function more type-safe and ensures that we only get a valid property value from the object.

Keyof is an important operator in TypeScript for creating generic, type-safe code. By mapping property names to their corresponding types, developers can write more robust code that is less prone to errors.
