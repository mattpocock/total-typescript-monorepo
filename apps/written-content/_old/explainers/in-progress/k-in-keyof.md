# `keyof` with Mapped Types

In TypeScript, the `keyof` operator is often used in conjunction with mapped types. A mapped type takes an object type and applies a transformation to each property using a type parameter. Here's an example of how to use `keyof` with a mapped type:

```typescript
interface Person {
  firstName: string;
  lastName: string;
  age: number;
}

type ReadonlyPerson = {
  readonly [K in keyof Person]: Person[K];
};

const person: ReadonlyPerson = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
};

person.firstName = "Jane"; // error: Cannot assign to 'firstName' because it is a read-only property
```

In this code, we define an interface `Person` with three properties. We then define a mapped type `ReadonlyPerson` that makes each property read-only by using the `readonly` modifier. The `in` keyword in the mapped type syntax allows us to loop through each property in `Person` and apply the transformation. By using `keyof Person` in the square brackets, we ensure that the mapped type only includes the properties defined in `Person`.

In the next line, we create an object `person` of type `ReadonlyPerson` with some sample data. Since we defined `ReadonlyPerson` to make all properties read-only, we get an error when we try to modify `person.firstName`.

Using `keyof` with mapped types allows developers to create types with specific properties that are checked at compile time. This can help catch errors early and make code more robust.
