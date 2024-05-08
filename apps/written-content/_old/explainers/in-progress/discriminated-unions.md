---
summary: "TypeScript's discriminated unions allow developers to create type-safe, flexible code that can handle multiple related types using a common discriminator property."
deps:
  - literal-types
  - union-types
---

# Discriminated Unions in TypeScript

TypeScript's discriminated unions allow developers to create type-safe, flexible code that can handle multiple, related types.

In TypeScript, a discriminated union is a type composed of two or more other types that share a common property - a discriminator. You can use this discriminator to distinguish between the different types in the union.

Here's an example:

```typescript
interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

type Shape = Square | Rectangle;

function area(shape: Shape) {
  switch (shape.kind) {
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

In this code, we define two interfaces, `Square` and `Rectangle`, that both have a `kind` property. We then define a `Shape` type that is a union of `Square` and `Rectangle`. Finally, we define a function `area` that takes a `Shape` argument and uses its `kind` property to determine which type it is and calculate its area.

Discriminated unions are especially useful when dealing with operations that might fail. For example, suppose you have an API endpoint that can either return a successful response or an error response:

```typescript
interface SuccessResponse {
  success: true;
  data: any;
}

interface ErrorResponse {
  success: false;
  message: string;
}

type Response = SuccessResponse | ErrorResponse;
```

You can use the discriminator property `success` to determine whether a response is successful or not. This makes it easy to handle responses in a type-safe way:

```typescript
function handleResponse(response: Response) {
  if (response.success) {
    console.log(response.data);
  } else {
    console.error(response.message);
  }
}
```
