# Does TypeScript Wizardry Produce Unintentional Coupling?

- Why am I talking about this?

TypeScript gives you a lot of power to do magic on the type level. There are dozens of language features that let your create types from other types.

Need to change an object's values? Use a mapped type. Need an if/else statement on the type level? Use a conditional type. Need to turn a value into a type? Use `typeof`.

A lot of my output over the last couple of years has been bringing these features to light. Total TypeScript has an entire module called Type Transformations.

But I've been so preoccupied with showing what _can_ be done, that I haven't stopped to describe what _should_ be done.

So let's pull back, and think about the downsides of TypeScript magic: unintentional coupling.

- What are coupled types?

## Derived vs Decoupled Types

Let's look at a simple example of coupled types:

```typescript
interface User {
  name: string;
  age: number;
}

interface UserWithId extends User {
  id: string;
}
```

In this example, `UserWithId` is coupled to `User`. If you change `User`, you have to change `UserWithId`. This is because `UserWithId` extends `User`.

- What's an example of coupled types?

- When are coupled types bad?

- When should you decouple your types?

- When should you couple your types?

- What techniques can you use to couple your types?
