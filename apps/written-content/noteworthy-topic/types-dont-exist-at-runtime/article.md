# TypeScript Types Don't Exist At Runtime

I tend to get involved in a lot of discussions about TypeScript online. And one of the most common misconceptions I see from folks just learning about TypeScript is that TypeScript's types exist at runtime.

This idea feels obvious when you come to TypeScript from other strongly-typed languages. In Java, C#, or even C++, types are a fundamental part of the language. They're used to influence the runtime behavior of the program.

But TypeScript is different - TypeScript's types don't exist at runtime. They're only used to help you catch errors at compile time. This is because TypeScript is designed to compile down to JavaScript, which doesn't have a type system.

Let's look at a few examples:

## Types

Types and interfaces let you describe the shape of a type. You will have thousands of lines of type declarations in your program. But they don't exist at runtime:

<TranspilePreview>

```ts
type Person = {
  name: string;
  age: number;
};

const person: Person = {
  name: "Alice",
  age: 30,
};

interface Animal {
  name: string;
  age: number;
}

const animal: Animal = {
  name: "Fluffy",
  age: 5,
};
```

</TranspilePreview>

Notice how the types `Person` and `Animal` are gone in the transpiled JavaScript, and all you're left with is the object literals.

## Type Assertions

You can use type assertions to tell TypeScript that you know more about a value than it does. But these assertions don't exist at runtime:

<TranspilePreview>

```ts
const str = "Hello, world!";

const num: number = str as unknown as number;
```

</TranspilePreview>

Just because `num` has been asserted to be a number doesn't mean it is one at runtime. TypeScript will trust you that `str` is a number, but if it's not, you'll get a runtime error.

This is a reason why type assertions are discouraged in TypeScript. They can lead to runtime errors if you're not careful.

## Function Parameters

You can use types to describe the shape of a function's parameters. But these types don't exist at runtime. They don't guarantee that your function will be called with the right arguments:

<TranspilePreview>

```ts
const add = (a: number, b: number) => a + b;

add(1, 2);

add("1" as any, "2" as any);
```

</TranspilePreview>

Notice that there is no extra code in the transpiled JavaScript to check that `add` is being called with the right arguments.

## Enums, Namespaces and Parameter Properties

There are some exceptions to this rule. Enums, namespaces, and parameter properties do have a runtime representation:

<TranspilePreview>

```ts
// Enums
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// Namespaces
namespace Geometry {
  export const PI = 3.14159;
}

// Parameter Properties
class Person {
  constructor(public name: string) {}
}
```

</TranspilePreview>

Most features in TypeScript disappear at runtime, but these three are the exception. They have a runtime representation that can be used in your program.

These features are all pretty old. They were added in an era when JavaScript was seen as relatively stagnant - and TypeScript was attractive because it added much-needed features like enums, classes and namespaces.

But now, JavaScript is in a much healthier place. It has classes built in. It has modules, which are an improved version of namespaces. Someday, according to [this proposal](https://github.com/rbuckton/proposal-enum), it might have enums.

So now, TypeScript takes a different approach - it sees its job as adding types to JavaScript, not adding new features to the language. If enums, namespaces or parameter properties were proposed now, they wouldn't be added to TypeScript.

This means that thinking of TypeScript as just adding types to JavaScript is a useful rule of thumb - with the exception of enums, namespaces and parameter properties.
