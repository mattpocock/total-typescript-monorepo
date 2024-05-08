---
summary: "Learn how to define optional properties on objects in TypeScript to make code more flexible when dealing with data that may not have all properties defined."
deps:
  - object-types
---

# Optional Properties on Objects in TypeScript

TypeScript allows developers to define optional properties on objects. This feature can make code more flexible when dealing with data that may not have all properties defined.

To define an optional property, simply add a question mark after the property name:

```typescript
interface User {
  name: string;
  age?: number;
}
```

In this example, the `age` property is optional. This means that an object of type `User` may or may not have an `age` property defined.

Optional properties are especially useful when dealing with external data sources that may not have all properties defined. For example, consider the following API response:

```typescript
interface ApiResponse {
  name: string;
  age?: number;
  email?: string;
}
```

With optional properties, we can define a type that can handle all possible variations of this response:

```typescript
interface User {
  name: string;
  age?: number;
  email?: string;
}
```

This means that we can handle the `ApiResponse` in a type-safe way:

```typescript
function handleApiResponse(
  response: ApiResponse
) {
  const user: User = {
    name: response.name,
    age: response.age,
    email: response.email,
  };

  // Do something with the `user` object
}
```
