You might have noticed that there are two ways you can annotate a function on an object in TypeScript.

```ts twoslash
interface Obj {
  // Method shorthand syntax
  version1(param: string): void;
  // Object property syntax
  version2: (param: string) => void;
}
```

They look very innocuous. But there's a subtle difference between the two. And thanks to a tweet from my friend [Andarist](https://twitter.com/AndaristRake/status/1753679301310927276), I can now say that method shorthand syntax should be avoided in almost all cases.

## Why Is Method Shorthand Syntax Bad?

Using the method shorthand syntax can result in runtime errors. This is for a complicated reason, but I'll try to explain it as best as I can.

Let's say we declare a `Dog` interface with a `barkAt` method.

```ts twoslash
interface Dog {
  barkAt(dog: Dog): void;
}
```

It turns out that when you use `Dog` to type a variable, you can annotate it with a _narrower_ type than the `Dog` interface:

```ts twoslash
interface Dog {
  barkAt(dog: Dog): void;
}

// ---cut---

interface SmallDog extends Dog {
  // Only small dogs whimper in this universe
  whimper: () => void;
}

const brian: Dog = {
  barkAt(dog: SmallDog) {},
};
```

This might look innocuous, but we're actually on the verge of a runtime error that TypeScript won't catch. Inside `brian`'s `barkAt` function we could easily call `dog.whimper()`.

```ts twoslash
interface Dog {
  barkAt(dog: Dog): void;
}

interface SmallDog extends Dog {
  // Only small dogs whimper in this universe
  whimper: () => void;
}

// ---cut---

const brian: Dog = {
  barkAt(smallDog: SmallDog) {
    smallDog.whimper();
  },
};
```

Then, we could declare a new dog - just a normal one without a `whimper` method:

```ts twoslash
interface Dog {
  barkAt(dog: Dog): void;
}

// ---cut---

const normalDog: Dog = {
  barkAt() {},
};
```

But when we pass the normal dog to `brian.barkAt`, it will fail at runtime:

```ts twoslash
interface Dog {
  barkAt(dog: Dog): void;
}

interface SmallDog extends Dog {
  // Only small dogs whimper in this universe
  whimper: () => void;
}

const brian: Dog = {
  barkAt(smallDog: SmallDog) {
    smallDog.whimper();
  },
};

const normalDog: Dog = {
  barkAt() {},
};

// ---cut---

brian.barkAt(normalDog); // runtime error here!
```

So this is TypeScript failing to prevent a runtime error. And it's all because of the method shorthand syntax.

## How Do We Fix This?

If we use object property syntax to define the method, TypeScript will throw an error if we try to assign a narrower type to the method:

```ts twoslash
// @errors: 2322
interface Dog {
  // 1. We change it to an object property syntax...
  barkAt: (dog: Dog) => void;
}

interface SmallDog extends Dog {
  whimper: () => void;
}

const brian: Dog = {
  // 2. ...and now it errors!
  barkAt(dog: SmallDog) {},
};
```

This is more in line with what we expect.

## Is It Something To Do With Arrow Functions?

A common misconception is that the syntax above refers to arrow functions vs function declarations. This is not the case. Both syntaxes can be used with arrow functions or function declarations.

```ts twoslash
interface Obj {
  methodShorthand(param: string): void;
  objectProperty: (param: string) => void;
}

function functionDeclaration(param: string) {}
const arrowFunction = (param: string) => {};

const examples: Obj[] = [
  {
    // You can pass arrow functions to method shorthands...
    methodShorthand: arrowFunction,
    // ...and vice versa
    objectProperty: functionDeclaration,
  },
  {
    methodShorthand: functionDeclaration,
    objectProperty: arrowFunction,
  },
];
```

As you can see, the syntax is not tied to the type of function you use.

## Would This Work With Types Instead Of Interfaces?

I've used `interface` in the example above, but the same problem occurs with `type`:

```ts twoslash
type Dog = {
  barkAt(dog: Dog): void;
};

type SmallDog = {
  whimper: () => void;
} & Dog;

const brian: Dog = {
  barkAt(smallDog: SmallDog) {
    smallDog.whimper();
  },
};

const normalDog: Dog = {
  barkAt() {},
};

brian.barkAt(normalDog); // runtime error here!
```

## Why Does This Happen?

This happens because the method shorthand syntax is _bivariant_. This means that the method can accept a type that is both narrower and wider than the original type.

This is not the case with the arrow function syntax. It only accepts a type that is narrower than the original type.

It's this unexpected bivariance that can lead to runtime errors.

## The ESLint Rule

If you want to avoid this problem, you can use the ESLint rule [`@typescript-eslint/method-signature-style`](https://typescript-eslint.io/rules/method-signature-style/). This rule will enforce the use of the arrow function syntax for method signatures.

```json
{
  "rules": {
    "@typescript-eslint/method-signature-style": [
      "error",
      "property"
    ]
  }
}
```

So, if you're seeing an error like...

> Shorthand method signature is forbidden. Use a function property instead.

...it's because you're using the method shorthand syntax, and some clever person has set up this rule to prevent you from doing so.

## Are There Any Use Cases?

The reason this exists in TypeScript is because, very occasionally, you want to allow bivarance on function declarations. I'm going to cop to the fact that I'm not quite sure what those reasons are.

Michael Arnaldi, one of the authors of EffectTS, seemed to have a good read on the situation in [this thread](https://twitter.com/MichaelArnaldi/status/1753759092558929957).
