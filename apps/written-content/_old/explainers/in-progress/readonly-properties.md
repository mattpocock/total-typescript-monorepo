---
summary: "Create immutable objects in TypeScript with readonly properties. Define and initialize them once and be sure they won't change at runtime."
---

# Readonly Properties on Objects

TypeScript allows developers to define readonly properties on objects. To define a readonly property, simply add the `readonly` keyword before the property name:

```typescript
interface User {
  readonly name: string;
  readonly age?: number;
}
```

In this example, both the `name` and `age` properties are readonly. This means that once the object is initialized, these properties cannot be changed.

Readonly properties are especially useful when dealing with data that should not be modified, such as configuration settings or constants. For example, consider the following configuration object:

```typescript
interface AppConfig {
  readonly name: string;
  readonly apiUrl: string;
  readonly maxRetries: number;
}
```

With readonly properties, we can ensure that this configuration object is not modified at runtime, which can prevent bugs and make the code easier to reason about.

To create an object with readonly properties, simply initialize the properties at the time of creation:

```typescript
const appConfig: AppConfig = {
  name: "MyApp",
  apiUrl: "https://api.example.com",
  maxRetries: 3,
};

appConfig.name = "MyApp2"; // Error!
```

Once this object is created, its properties cannot be modified.

## `Readonly` Utility Type

If we've got an existing type that _isn't_ readonly, we can make it readonly by using the `Readonly` utility type:

```typescript
interface User {
  name: string;
  age?: number;
}

const readonlyUser: Readonly<User> = {
  name: "Jane Doe",
  age: 42,
};

readonlyUser.name = "John Doe"; // Error!
```
