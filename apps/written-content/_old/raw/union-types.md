---
summary: "Union types in TypeScript allow for assigning a variable or function parameter to be of multiple types, providing flexibility and maintaining type safety."
---

# Understanding Union Types in TypeScript

In TypeScript, union types allow you to assign a variable or function parameter to multiple types. This provides flexibility while maintaining type safety.

Here's an example of a union type in a function argument:

```typescript
function printId(id: string | number) {
  console.log(`ID is: ${id}`);
}

printId("abc"); // Outputs: ID is: abc
printId(123); // Outputs: ID is: 123
```

Union types can be used with any type, including custom ones:

```typescript
type Status = "success" | "failure";

function printStatus(status: Status) {
  console.log(`Status is: ${status}`);
}

printStatus("success"); // Outputs: Status is: success
printStatus("error"); // Type error!
```

As you can see, union types provide a level of type safety that `any` type lacks. It prevents errors at compile-time, reducing the chances of runtime issues.

You can also use union types with interfaces and classes:

```typescript
interface Dog {
  woof(): void;
}

interface Cat {
  meow(): void;
}

class Pet implements Dog, Cat {
  woof() {
    console.log("Woof!");
  }

  meow() {
    console.log("Meow!");
  }
}

function playWithPet(pet: Dog | Cat) {
  if ("woof" in pet) {
    pet.woof(); // Only possible if it's a Dog
  }

  if ("meow" in pet) {
    pet.meow(); // Only possible if it's a Cat
  }
}

playWithPet(new Pet()); // Outputs: Woof! Meow!
```

One thing to keep in mind is that union types can make code harder to read and understand. You should use them only when necessary and ensure that your code remains readable and maintainable.

In summary, union types in TypeScript offer a powerful way to enhance the flexibility of your code while maintaining type safety.
