This error occurs when you fail to add a type annotation to a parameter in a function.

```ts twoslash
// @errors: 7006
const addTwoNumbers = (a, b) => {
  return a + b;
};
```

## Why Is It Happening?

This is happening because of a setting that most TypeScript projects have turned on - strict mode.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Strict mode tells TypeScript to add more checks to your code to make sure it's safe. One of these checks is to make sure that all parameters have a type annotation.

Pretty much all modern TypeScript projects use strict mode, so you'll see this error a lot.

## Why Is This Error Part Of Strict Mode?

TypeScript can't infer the type of a parameter if you don't give it a type annotation. In the example above, TypeScript can't infer from usage what the type of `a` and `b` should be.

Adding two parameters together could be a number, sure. But it could be that you want to concatenate two strings together, which is also possible with the `+` operator.

```ts twoslash
// @errors: 7006
const concatTwoStrings = (a, b) => {
  return a + b;
};
```

So, in strict mode TypeScript demands that you add a type annotation to all parameters. This is to make sure your function is called correctly:

```ts twoslash
// @errors: 2345
const addTwoNumbers = (a: number, b: number) => {
  return a + b;
};

addTwoNumbers(1, 2); // OK
addTwoNumbers("1", "2"); // Error!
```

## What Is An Implicit Any?

If you don't have strict mode turned on, TypeScript will automatically assign the `any` type to parameters that don't have a type annotation.

```ts twoslash
// @strict: false
const addTwoNumbers = (a, b) => {
  return a + b;
};

const result = addTwoNumbers(1, 2);
//    ^?
```

This is bad, because `any` disables type checking on anything it's applied to. We can begin really messing up if we're not careful:

```ts twoslash
// @strict: false
const addTwoNumbers = (a, b) => {
  return a + b;
};

const result = addTwoNumbers(1, 2);

result.touppercase(); // No error!
```

This code will fail at runtime, but because we're using `any` it won't yell at us in our IDE.

So, an 'implicit any' is when TypeScript implicitly assigns the `any` type to a variable or parameter. It's bad, and the [`noImplicitAny` setting](https://www.typescriptlang.org/tsconfig#noImplicitAny) is bundled as part of `strict` mode for that reason.
