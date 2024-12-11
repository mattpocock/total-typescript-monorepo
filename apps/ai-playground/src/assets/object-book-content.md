# Chapter 1: Essential Types And Annotations

Now we've covered most of the why of TypeScript, it's time to start with the how. We'll cover key concepts like type annotations and type inference, as well as how to start writing type-safe functions.

It's important to build a solid foundation, as everything you'll learn later builds upon what you'll learn in this chapter.

## Basic Annotations

One of the most common things you'll need to do as a TypeScript developer is to annotate your code. Annotations tell TypeScript what type something is supposed to be.

Annotations will often use a `:` - this is used to tell TypeScript that a variable or function parameter is of a certain type.

### Function Parameter Annotations

One of the most important annotations you'll use is for function parameters.

For example, here is a `logAlbumInfo` function that takes in a `title` string, a `trackCount` number, and an `isReleased` boolean:

```ts twoslash
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
) => {
  // implementation
};
```

Each parameter's type annotation enables TypeScript to check that the arguments passed to the function are of the correct type. If the type doesn't match up, TypeScript will show a squiggly red line under the offending argument.

```ts twoslash
// @errors: 2345
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
) => {
  // implementation
};

// ---cut---
logAlbumInfo("Black Gold", false, 15);
```

In the example above, we would first get an error under `false` because a boolean isn't assignable to a number.

```ts twoslash
// @errors: 2345
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
) => {
  // implementation
};

// ---cut---
logAlbumInfo("Black Gold", 20, 15);
```

After fixing that, we would have an error under `15` because a number isn't assignable to a boolean.

### Variable Annotations

As well as function parameters, you can also annotate variables.

Here's an example of some variables, with their associated types.

```ts twoslash
let albumTitle: string = "Midnights";
let isReleased: boolean = true;
let trackCount: number = 13;
```

Notice how each variable name is followed by a `:` and its primitive type before its value is set.

Variable annotations are used to explicitly tell TypeScript what we expect the types of our variables to be.

Once a variable has been declared with a specific type annotation, TypeScript will ensure the variable remains compatible with the type you specified.

For example, this reassignment would work:

```ts twoslash
let albumTitle: string = "Midnights";

albumTitle = "1989";
```

But this one would show an error:

```ts twoslash
// @errors: 2322
let isReleased: boolean = true;

isReleased = "yes";
```

TypeScript's static type checking is able to spot errors at compile time, which is happening behind the scenes as you write your code.

In the case of the `isReleased` example above, the error message reads:

```txt
Type 'string' is not assignable to type 'boolean'.
```

In other words, TypeScript is telling us that it expects `isReleased` to be a boolean, but instead received a `string`.

It's nice to be warned about these kinds of errors before we even run our code!

### The Basic Types

TypeScript has a number of basic types that you can use to annotate your code. Here are a few of the most common ones:

```ts twoslash
let example1: string = "Hello World!";
let example2: number = 42;
let example3: boolean = true;
let example4: symbol = Symbol();
let example5: bigint = 123n;
let example6: null = null;
let example7: undefined = undefined;
```

Each of these types is used to tell TypeScript what type a variable or function parameter is supposed to be.

You can express much more complex types in TypeScript: arrays, objects, functions and much more. We'll cover these in later chapters.

### Type Inference

TypeScript gives you the ability to annotate almost any value, variable or function in your code. You might be thinking “wait, do I need to annotate everything? That's a lot of extra code.”

As it turns out, TypeScript can infer a lot from the context that your code is run.

#### Variables Don't Always Need Annotations

Let's look again at our variable annotation example, but drop the annotations:

```ts twoslash
let albumTitle = "Midnights";
let isReleased = true;
let trackCount = 13;
```

We didn't add the annotations, but TypeScript isn't complaining. What's going on?

Try hovering your cursor over each variable.

```ts twoslash
// hovering over each variable name

let albumTitle: string;
let isReleased: boolean;
let trackCount: number;
```

Even though they aren't annotated, TypeScript is still picking up the type that they're each supposed to be. This is TypeScript inferring the type of the variable from usage.

It behaves as if we'd annotated it, warning us if we try to assign it a different type from what it was assigned originally:

```ts twoslash
// @errors: 2322

let isReleased = true;

isReleased = "yes";
```

And also giving us autocomplete on the variable:

```ts
albumTitle.toUpper; // shows `toUpperCase` in autocomplete
```

This is an extremely powerful part of TypeScript. It means that you can mostly _not_ annotate variables and still have your IDE know what type things are.

#### Function Parameters Always Need Annotations

But type inference can't work everywhere. Let's see what happens if we remove the type annotations from the `logAlbumInfo` function's parameters:

```ts twoslash
// @errors: 7006
const logAlbumInfo = (
  title,

  trackCount,

  isReleased
) => {
  // rest of function body
};
```

On its own, TypeScript isn't able to infer the types of the parameters, so it shows an error under each parameter name.

This is because functions are very different to variables. TypeScript can see what value is assigned to which variable, so it can make a good guess about the type.

But TypeScript can't tell from a function parameter alone what type it's supposed to be. When you don't annotate it, it defaults the type to `any` - a scary, unsafe type.

It also can't detect it from usage. If we had an 'add' function that took two parameters, TypeScript wouldn't be able to tell that they were supposed to be numbers:

```ts twoslash
// @errors: 7006
function add(a, b) {
  return a + b;
}
```

`a` and `b` could be strings, booleans, or anything else. TypeScript can't know from the function body what type they're supposed to be.

So, when you're declaring a named function, their parameters always need annotations in TypeScript.

### The `any` Type

The error we encountered in the 'Function Parameters Always Need Annotations' section was pretty scary:

```
Parameter 'title' implicitly has an 'any' type.
```

When TypeScript doesn't know what type something is, it assigns it the `any` type.

This type breaks TypeScript's type system. It turns off type safety on the thing it's assigned to.

This means that anything can be assigned to it, any property on it can be accessed/assigned to, and it can be called like a function.

```ts twoslash
let anyVariable: any = "This can be anything!";

anyVariable(); // no error

anyVariable.deep.property.access; // no error
```

The code above will error at runtime, but TypeScript isn't giving us a warning!

So, using `any` can be used to turn off errors in TypeScript. It can be a useful escape hatch for when a type is too complex to describe.

But over-using `any` defeats the purpose of using TypeScript, so it's best to avoid using it whenever possible– whether implicitly or explicitly.

### Exercises

#### Exercise 1: Basic Types with Function Parameters

Let's start with an `add` function which takes two boolean parameters `a` and `b` and returns `a + b`:

```ts twoslash
// @errors: 2365
export const add = (a: boolean, b: boolean) => {
  return a + b;
};
```

A `result` variable is created by calling the `add` function. The `result` variable is then checked to see if it is equal to a `number`:

```ts twoslash
// @errors: 2365 2345 2344
import { Expect, Equal } from "@total-typescript/helpers";

export const add = (a: boolean, b: boolean) => {
  return a + b;
};

// ---cut---
const result = add(1, 2);

type test = Expect<Equal<typeof result, number>>;
```

Currently, there are a few errors in the code that are marked by red squiggly lines.

The first is on the `return` line of the `add` function, where we have `a + b`:

```
Operator '+' cannot be applied to types 'boolean' and 'boolean'
```

There's also an error below the `1` argument in the `add` function call:

```
Argument of type 'number' is not assignable to parameter of type 'boolean'
```

Finally, we can see that our `test` result has an error because the `result` is currently typed as `any`, which is not equal to `number`.

Your challenge is to consider how we can change the types to make the errors go away, and to ensure that `result` is a `number`. You can hover over `result` to check it.

<Exercise title="Exercise 1: Basic Types with Function Parameters" filePath="/src/015-essential-types-and-annotations/020-basic-types-with-function-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAd9N"></Exercise>

#### Exercise 2: Annotating Empty Parameters

Here we have a `concatTwoStrings` function that is similar in shape to the `add` function. It takes two parameters, `a` and `b`, and returns a string.

```ts twoslash
// @errors: 7006
const concatTwoStrings = (a, b) => {
  return [a, b].join(" ");
};
```

There are currently errors on the `a` and `b` parameters, which have not been annotated with types.

The `result` of calling `concatTwoStrings` with `"Hello"` and `"World"` and checking if it is a `string` does not show any errors:

```ts twoslash
// @errors: 7006
import { Expect, Equal } from "@total-typescript/helpers";

const concatTwoStrings = (a, b) => {
  return [a, b].join(" ");
};

// ---cut---
const result = concatTwoStrings("Hello", "World");

type test = Expect<Equal<typeof result, string>>;
```

Your job is to add some function paramater annotations to the `concatTwoStrings` function to make the errors go away.

<Exercise title="Exercise 2: Annotating Empty Parameters" filePath="/src/015-essential-types-and-annotations/021-annotating-empty-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdKe"></Exercise>

#### Exercise 3: The Basic Types

As we've seen, TypeScript will show errors when types don't match.

This set of examples shows us the basic types that TypeScript gives us to describe JavaScript:

```ts twoslash
// @errors: 2322
export let example1: string = "Hello World!";
export let example2: string = 42;
export let example3: string = true;
export let example4: string = Symbol();
export let example5: string = 123n;
```

Note that the colon `:` is used to annotate the type of each variable, just like it was for typing the function parameters.

You'll also notice there are several errors.

Hovering over each of the underlined variables will display any associated error messages.

For example, hovering over `example2` will show:

```
Type 'number' is not assignable to type 'string'.
```

The type error for `example3` tells us:

```
Type 'boolean' is not assignable to type 'string'.
```

Change the types of the annotations on each variable to make the errors go away.

<Exercise title="Exercise 3: The Basic Types" filePath="/src/015-essential-types-and-annotations/022-all-types.problem.ts" resourceId="NMpTvrI4rUCyVa4GVzY1iN"></Exercise>

#### Exercise 4: The `any` Type

Here is a function called `handleFormData` that accepts an `e` typed as `any`. The function prevents the default form submission behavior, then creates an object from the form data and returns it:

```ts
const handleFormData = (e: any) => {
  e.preventDefault();

  const data = new FormData(e.terget);

  const value = Object.fromEntries(data.entries());

  return value;
};
```

Here is a test for the function that creates a form, sets the `innerHTML` to add an input, and then manually submits the form. When it submits, we expect the value to equal the value that was in our form that we grafted in there:

```ts
it("Should handle a form submit", () => {
  const form = document.createElement("form");

  form.innerHTML = `
<input name="name" value="John Doe"></Exercise>
`;

  form.onsubmit = (e) => {
    const value = handleFormData(e);

    expect(value).toEqual({ name: "John Doe" });
  };

  form.requestSubmit();

  expect.assertions(1);
});
```

Note that this isn't the normal way you would test a form, but it provides a way to test the example `handleFormData` function more extensively.

In the code's current state, there are no red squiggly lines present.

However, when running the test with Vitest we get an error similar to the following:

```
This error originated in "any.problem.ts" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

The latest test that might've caused the error is "Should handle a form submit". It might mean one of the following:

- The error was thrown, while Vitest was running this test.

- This was the last recorded test before the error was thrown, if error originated after test finished its execution.
```

Why is this error happening? Why isn't TypeScript giving us an error here?

I'll give you a clue. I've hidden a nasty typo in there. Can you fix it?

<Exercise title="Exercise 4: The `any` Type" filePath="/src/015-essential-types-and-annotations/032.5-any.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAeU3"></Exercise>

#### Solution 1: Basic Types with Function Parameters

Common sense tells us that the `boolean`s in the `add` function should be replaced with some sort of `number` type.

If you are coming from another language, you might be tempted to try using `int` or `float`, but TypeScript only has the `number` type:

```ts twoslash
function add(a: number, b: number) {
  return a + b;
}
```

Making this change resolves the errors, and also gives us some other bonuses.

If we try calling the `add` function with a string instead of a number, we'd get an error that type `string` is not assignable to type `number`:

```ts twoslash
// @errors: 2345
function add(a: number, b: number) {
  return a + b;
}

// ---cut---
add("something", 2);
```

Not only that, but the result of our function is now inferred for us:

```ts twoslash
function add(a: number, b: number) {
  return a + b;
}

// ---cut---
const result = add(1, 2);
//    ^?
```

So TypeScript can not only infer variables, but also the return types of functions.

#### Solution 2: Annotating Empty Parameters

As we know, function parameters always need annotations in TypeScript.

So, let's update the function declaration parameters so that `a` and `b` are both specified as `string`:

```ts twoslash
const concatTwoStrings = (a: string, b: string) => {
  return [a, b].join(" ");
};
```

This change fixes the errors.

For a bonus point, what type will the return type be inferred as?

```ts twoslash
const concatTwoStrings = (a: string, b: string) => {
  return [a, b].join(" ");
};

// ---cut---
const result = concatTwoStrings("Hello", "World");
//    ^?
```

#### Solution 3: Updating Basic Types

Each of the examples represents the TypeScript's basic types, and would be annotated as follows:

```ts twoslash
let example1: string = "Hello World!";
let example2: number = 42;
let example3: boolean = true;
let example4: symbol = Symbol();
let example5: bigint = 123n;
```

We've already seen `string`, `number`, and `boolean`. The `symbol` type is used for `Symbol`s which are used to ensure property keys are unique. The `bigint` type is used for numbers that are too large for the `number` type.

However, in practice you mostly won't annotate variables like this. If we remove the explicit type annotations, there won't be any errors at all:

```ts twoslash
let example1 = "Hello World!";
let example2 = 42;
let example3 = true;
let example4 = Symbol();
let example5 = 123n;
```

These basic types are very useful to know, even if you don't always need them for your variable declarations.

#### Solution 4: The `any` Type

In this case, using `any` did not help us at all. In fact, `any` annotations seem to actually turn off type checking!

With the `any` type, we're free to do anything we want to the variable, and TypeScript will not prevent it.

Using `any` also disables useful features like autocompletion, which can help you avoid typos.

That's right-- the error in the above code was caused by a typo of `e.terget` instead of `e.target` when creating the `FormData`!

```ts
const handleFormData = (e: any) => {
  e.preventDefault();

  const data = new FormData(e.terget); // e.terget! Whoops!

  const value = Object.fromEntries(data.entries());

  return value;
};
```

If `e` had been properly typed, this error would have been caught by TypeScript right away. We'll come back to this example in the future to see the proper typing.

Using `any` may seem like a quick fix when you have trouble figuring out how to properly type something, but it can come back to bite you later.

## Object Literal Types

Now that we've done some exploration with basic types, let's move on to object types.

Object types are used to describe the shape of objects. Each property of an object can have its own type annotation.

When defining an object type, we use curly braces to contain the properties and their types:

```ts twoslash
const talkToAnimal = (animal: { name: string; type: string; age: number }) => {
  // rest of function body
};
```

This curly braces syntax is called an object literal type.

### Optional Object Properties

We can use `?` operator to mark the `age` property as optional:

```ts twoslash
const talkToAnimal = (animal: { name: string; type: string; age?: number }) => {
  // rest of function body
};
```

One cool thing about type annotations with object literals is that they provide auto-completion for the property names while you're typing.

For instance, when calling `talkToAnimal`, it will provide you with an auto-complete dropdown with suggestions for the `name`, `type`, and `age` properties.

This feature can save you a lot of time, and also helps to avoid typos in a situation when you have several properties with similar names.

### Exercises

#### Exercise 1: Object Literal Types

Here we have a `concatName` function that accepts a `user` object with `first` and `last` keys:

```ts twoslash
// @errors: 7006
const concatName = (user) => {
  return `${user.first} ${user.last}`;
};
```

The test expects that the full name should be returned, and it is passing:

```ts
it("should return the full name", () => {
  const result = concatName({
    first: "John",
    last: "Doe",
  });

  type test = Expect<Equal<typeof result, string>>;

  expect(result).toEqual("John Doe");
});
```

However, there is a familiar error on the `user` parameter in the `concatName` function:

```
Parameter 'user' implicitly has an 'any' type.
```

We can tell from the `concatName` function body that it expects `user.first` and `user.last` to be strings.

How could we type the `user` parameter to ensure that it has these properties and that they are of the correct type?

<Exercise title="Exercise 1: Object Literal Types" filePath="/src/015-essential-types-and-annotations/025-object-literal-types.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdzz"></Exercise>

#### Exercise 2: Optional Property Types

Here's a version of the `concatName` function that has been updated to return just the first name if a last name wasn't provided:

```ts twoslash
const concatName = (user: { first: string; last: string }) => {
  if (!user.last) {
    return user.first;
  }

  return `${user.first} ${user.last}`;
};
```

Like before, TypeScript gives us an error when testing that the function returns only the first name when no last name is provided passes:

```ts twoslash
// @errors: 2345
const concatName = (user: { first: string; last: string }) => {
  if (!user.last) {
    return user.first;
  }

  return `${user.first} ${user.last}`;
};

// ---cut---
const result = concatName({
  first: "John",
});
```

The error tells us that we are missing a property, but the error is incorrect. We _do_ want to support objects that only include a `first` property. In other words, `last` needs to be optional.

How would you update this function to fix the errors?

<Exercise title="Exercise 2: Optional Property Types" filePath="/src/015-essential-types-and-annotations/026-optional-property-types.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAeIm"></Exercise>

#### Solution 1: Object Literal Types

In order to annotate the `user` parameter as an object, we can use the curly brace syntax `{}`.

Let's start by annotating the `user` parameter as an empty object:

```ts twoslash
// @errors: 2339
const concatName = (user: {}) => {
  return `${user.first} ${user.last}`;
};
```

The errors change. This is progress, of a kind. The errors now show up under `.first` and `.last` in the function return.

In order to fix these errors, we need to add the `first` and `last` properties to the type annotation.

```ts twoslash
const concatName = (user: { first: string; last: string }) => {
  return `${user.first} ${user.last}`;
};
```

Now TypeScript knows that both the `first` and `last` properties of `user` are strings, and the test passes.

#### Solution 2: Optional Property Types

Similar to when we set a function parameter as optional, we can use the `?` to specify that an object's property is optional.

As seen in a previous exercise, we can add a question mark to function parameters to make them optional:

```ts twoslash
function concatName(user: { first: string; last?: string }) {
  // implementation
}
```

Adding `?:` indicates to TypeScript that the property doesn't need to be present.

If we hover over the `last` property inside of the function body, we'll see that the `last` property is `string | undefined`:

```
// hovering over `user.last`

(property) last?: string | undefined
```

This means it's `string` OR `undefined`. This is a useful feature of TypeScript that we'll see more of in the future.

## Type Aliases

So far, we've been declaring all of our types inline. This is fine for these simple examples, but in a real application we're going to have types which repeat a lot across our app.

These might be users, products, or other domain-specific types. We don't want to have to repeat the same type definition in every file that needs it.

This is where the `type` keyword comes in. It allows us to define a type once and use it in multiple places.

```ts twoslash
type Animal = {
  name: string;
  type: string;
  age?: number;
};
```

This is what's called a type alias. It's a way to give a name to a type, and then use that name wherever we need to use that type.

To create a new variable with the `Animal` type, we'll add it as a type annotation after the variable name:

```ts twoslash
type Animal = {
  name: string;
  type: string;
  age?: number;
};

// ---cut---
let pet: Animal = {
  name: "Karma",
  type: "cat",
};
```

We can also use the `Animal` type alias in place of the object type annotation in a function:

```ts twoslash
type Animal = {
  name: string;
  type: string;
  age?: number;
};

// ---cut---
const getAnimalDescription = (animal: Animal) => {
  // implementation
};
```

And call the function with our `pet` variable:

```ts
const desc = getAnimalDescription(pet);
```

Type aliases can be objects, but they can also use basic types:

```ts
type Id = string | number;
```

We'll look at this syntax later, but it's basically saying that an `Id` can be either a `string` or a `number`.

Using a type alias is a great way to ensure there's a single source of truth for a type definition, which makes it easier to make changes in the future.

### Sharing Types Across Modules

Type aliases can be created in their own `.ts` files and imported into the files where you need them. This is useful when sharing types in multiple places, or when a type definition gets too large:

```ts
// In shared-types.ts

export type Animal = {
  width: number;
  height: number;
};

// In index.ts

import { Animal } from "./shared-types";
```

As a convention, you can even create your own `.types.ts` files. This can help to keep your type definitions separate from your other code.

### Exercises

#### Exercise 1: The `type` Keyword

Here's some code that uses the same type in multiple places:

```ts twoslash
const getRectangleArea = (rectangle: { width: number; height: number }) => {
  return rectangle.width * rectangle.height;
};

const getRectanglePerimeter = (rectangle: {
  width: number;
  height: number;
}) => {
  return 2 * (rectangle.width + rectangle.height);
};
```

The `getRectangleArea` and `getRectanglePerimeter` functions both take in a `rectangle` object with `width` and `height` properties.

Tests for each function pass as expected:

```ts
it("should return the area of a rectangle", () => {
  const result = getRectangleArea({
    width: 10,
    height: 20,
  });

  type test = Expect<Equal<typeof result, number>>;

  expect(result).toEqual(200);
});

it("should return the perimeter of a rectangle", () => {
  const result = getRectanglePerimeter({
    width: 10,
    height: 20,
  });

  type test = Expect<Equal<typeof result, number>>;

  expect(result).toEqual(60);
});
```

Even though everything is working as expected, there's an opportunity for refactoring to clean things up.

How could you use the `type` keyword to make this code more readable?

<Exercise title="Exercise 1: The `type` Keyword" filePath="/src/015-essential-types-and-annotations/027-type-keyword.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll3za"></Exercise>

#### Solution 1: The `type` Keyword

You can use the `type` keyword to create a `Rectangle` type with `width` and `height` properties:

```ts twoslash
type Rectangle = {
  width: number;
  height: number;
};
```

With the type alias created, we can update the `getRectangleArea` and `getRectanglePerimeter` functions to use the `Rectangle` type:

```ts twoslash
type Rectangle = {
  width: number;
  height: number;
};

// ---cut---
const getRectangleArea = (rectangle: Rectangle) => {
  return rectangle.width * rectangle.height;
};

const getRectanglePerimeter = (rectangle: Rectangle) => {
  return 2 * (rectangle.width + rectangle.height);
};
```

This makes the code a lot more concise, and gives us a single source of truth for the `Rectangle` type.

## Arrays and Tuples

### Arrays

You can also describe the types of arrays in TypeScript. There are two different syntaxes for doing this.

The first option is the square bracket syntax. This syntax is similar to the type annotations we've made so far, but with the addition of two square brackets at the end to indicate an array.

```ts twoslash
let albums: string[] = [
  "Rubber Soul",
  "Revolver",
  "Sgt. Pepper's Lonely Hearts Club Band",
];

let dates: number[] = [1965, 1966, 1967];
```

The second option is to explicitly use the `Array` type with angle brackets containing the type of data the array will hold:

```ts twoslash
let albums: Array<string> = [
  "Rubber Soul",
  "Revolver",
  "Sgt. Pepper's Lonely Hearts Club Band",
];
```

Both of these syntaxes are equivalent, but the square bracket syntax is a bit more concise when creating arrays. It's also the way that TypeScript presents error messages. Keep the angle bracket syntax in mind, though– we'll see more examples of it later on.

#### Arrays Of Objects

When specifying an array's type, you can use any built-in types, inline types, or type aliases:

```ts twoslash
type Album = {
  artist: string;
  title: string;
  year: number;
};

let selectedDiscography: Album[] = [
  {
    artist: "The Beatles",
    title: "Rubber Soul",
    year: 1965,
  },
  {
    artist: "The Beatles",
    title: "Revolver",
    year: 1966,
  },
];
```

And if you try to update the array with an item that doesn't match the type, TypeScript will give you an error:

```ts twoslash
// @errors: 2353
type Album = {
  artist: string;
  title: string;
  year: number;
};

let selectedDiscography: Album[] = [
  {
    artist: "The Beatles",
    title: "Rubber Soul",
    year: 1965,
  },
  {
    artist: "The Beatles",
    title: "Revolver",
    year: 1966,
  },
];

// ---cut---
selectedDiscography.push({ name: "Karma", type: "cat" });
```

### Tuples

Tuples let you specify an array with a fixed number of elements, where each element has its own type.

Creating a tuple is similar to an array's square bracket syntax - except the square brackets contain the types instead of abutting the variable name:

```ts twoslash
// Tuple
let album: [string, number] = ["Rubber Soul", 1965];

// Array
let albums: string[] = [
  "Rubber Soul",
  "Revolver",
  "Sgt. Pepper's Lonely Hearts Club Band",
];
```

Tuples are useful for grouping related information together without having to create a new type.

For example, if we wanted to group an album with its play count, we could do something like this:

```ts twoslash
type Album = {
  artist: string;
  title: string;
  year: number;
};

// ---cut---
let albumWithPlayCount: [Album, number] = [
  {
    artist: "The Beatles",
    title: "Revolver",
    year: 1965,
  },
  10000,
];
```

#### Named Tuples

To add more clarity to the tuple, names for each of the types can be added inside of the square brackets:

```ts twoslash
type Album = {
  artist: string;
  title: string;
  year: number;
};

// ---cut---
type MyTuple = [album: Album, playCount: number];
```

This can be helpful when you have a tuple with a lot of elements, or when you want to make the code more readable.

### Exercises

#### Exercise 1: Array Type

Consider the following shopping cart code:

```ts twoslash
// @errors: 2353
type ShoppingCart = {
  userId: string;
};

const processCart = (cart: ShoppingCart) => {
  // Do something with the cart in here
};

processCart({
  userId: "user123",
  items: ["item1", "item2", "item3"],
});
```

We have a type alias for `ShoppingCart` that currently has a `userId` property of type `string`.

The `processCart` function takes in a `cart` parameter of type `ShoppingCart`. Its implementation doesn't matter at this point.

What does matter is that when we call `processCart`, we are passing in an object with a `userId` and an `items` property that is an array of strings.

There is an error underneath `items` that reads:

```
Argument of type '{ userId: string; items: string[]; }' is not assignable to parameter of type 'ShoppingCart'.

Object literal may only specify known properties, and 'items' does not exist in type 'ShoppingCart'.
```

As the error message points out, there is not currently a property called `items` on the `ShoppingCart` type.

How would you fix this error?

<Exercise title="Exercise 1: Array Type" filePath="/src/015-essential-types-and-annotations/028-arrays.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll3za"></Exercise>

#### Exercise 2: Arrays of Objects

Consider this `processRecipe` function which takes in a `Recipe` type:

```ts twoslash
// @errors: 2353
type Recipe = {
  title: string;
  instructions: string;
};

const processRecipe = (recipe: Recipe) => {
  // Do something with the recipe in here
};

processRecipe({
  title: "Chocolate Chip Cookies",
  ingredients: [
    { name: "Flour", quantity: "2 cups" },
    { name: "Sugar", quantity: "1 cup" },
  ],
  instructions: "...",
});
```

The function is called with an object containing `title`, `instructions`, and `ingredients` properties, but there are currently errors because the `Recipe` type doesn't currently have an `ingredients` property:

```
Argument of type '{title: string; ingredients: { name: string; quantity: string; }[]; instructions: string; }' is not assignable to parameter of type 'Recipe'.

Object literal may only specify known properties, and 'ingredients' does not exist in type 'Recipe'.
```

By combining what you've seen with typing object properties and working with arrays, how would you specify ingredients for the `Recipe` type?

<Exercise title="Exercise 2: Arrays of Objects" filePath="/src/015-essential-types-and-annotations/029-arrays-of-objects.problem.ts" resourceId="YgFRxBViy44CfW0H2dToDx"></Exercise>

#### Exercise 3: Tuples

Here we have a `setRange` function that takes in an array of numbers:

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

// @noUncheckedIndexedAccess: true

// ---cut---
const setRange = (range: Array<number>) => {
  const x = range[0];
  const y = range[1];

  // Do something with x and y in here
  // x and y should both be numbers!

  type tests = [
    Expect<Equal<typeof x, number>>,
    Expect<Equal<typeof y, number>>,
  ];
};
```

Inside the function, we grab the first element of the array and assign it to `x`, and we grab the second element of the array and assign it to `y`.

There are two tests inside the `setRange` function that are currently failing.

Using the `// @ts-expect-error` directive, we find there are a couple more errors that need fixing. Recall that this directive tells TypeScript we know there will be an error on the next line, so ignore it. However, if we say we expect an error but there isn't one, we will get the red squiggly lines on the actual `//@ts-expect-error` line.

```ts twoslash
// @errors: 2578
import { Expect, Equal } from "@total-typescript/helpers";

// @noUncheckedIndexedAccess: true

// ---cut---
const setRange = (range: Array<number>) => {
  const x = range[0];
  const y = range[1];
};

// ---cut---
// @ts-expect-error too few arguments
setRange([0]);

// @ts-expect-error too many arguments
setRange([0, 10, 20]);
```

The code for the `setRange` function needs an updated type annotation to specify that it only accepts a tuple of two numbers.

<Exercise title="Exercise 3: Tuples" filePath="/src/015-essential-types-and-annotations/031-tuples.problem.ts" resourceId="YgFRxBViy44CfW0H2dTomV"></Exercise>

#### Exercise 4: Optional Members of Tuples

This `goToLocation` function takes in an array of coordinates. Each coordinate has a `latitude` and `longitude`, which are both numbers, as well as an optional `elevation` which is also a number:

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

// ---cut---
const goToLocation = (coordinates: Array<number>) => {
  const latitude = coordinates[0];
  const longitude = coordinates[1];
  const elevation = coordinates[2];

  // Do something with latitude, longitude, and elevation in here

  type tests = [
    Expect<Equal<typeof latitude, number>>,
    Expect<Equal<typeof longitude, number>>,
    Expect<Equal<typeof elevation, number | undefined>>,
  ];
};
```

Your challenge is to update the type annotation for the `coordinates` parameter to specify that it should be a tuple of three numbers, where the third number is optional.

<Exercise title="Exercise 4: Optional Members of Tuples" filePath="/src/015-essential-types-and-annotations/032-optional-members-of-tuples.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll7aP"></Exercise>

#### Solution 1: Array Type

For the `ShoppingCart` example, defining an array of `item` strings would looks like this when using the square bracket syntax:

```ts twoslash
type ShoppingCart = {
  userId: string;
  items: string[];
};
```

With this in place, we must pass in `items` as an array. A single string or other type would result in a type error.

The other syntax is to explicitly write `Array` and pass it a type inside the angle brackets:

```ts twoslash
type ShoppingCart = {
  userId: string;
  items: Array<string>;
};
```

#### Solution 2: Arrays of Objects

There are a few different ways to express an array of objects.

One approach would be to create a new `Ingredient` type that we can use to represent the objects in the array:

```ts twoslash
type Ingredient = {
  name: string;
  quantity: string;
};
```

Then the `Recipe` type can be updated to include an `ingredients` property of type `Ingredient[]`:

```ts twoslash
type Ingredient = {
  name: string;
  quantity: string;
};

// ---cut---
type Recipe = {
  title: string;
  instructions: string;
  ingredients: Ingredient[];
};
```

This solution reads nicely, fixes the errors, and helps to create a mental map of our domain model.

As seen previously, using the `Array<Ingredient>` syntax would also work:

```ts
type Recipe = {
  title: string;
  instructions: string;
  ingredients: Array<Ingredient>;
};
```

It's also possible to specify the `ingredients` property as an inline object literal on the `Recipe` type using the square brackets:

```ts
type Recipe = {
  title: string;
  instructions: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
};
```

Or using `Array<>`:

```ts
type Recipe = {
  title: string;
  instructions: string;
  ingredients: Array<{
    name: string;
    quantity: string;
  }>;
};
```

The inline approaches are useful, but I prefer extracting them out to a new type. This means that if another part of your application needs to use the `Ingredient` type, it can.

#### Solution 3: Tuples

In this case, we would update the `setRange` function to use the tuple syntax instead of the array syntax:

```ts
const setRange = (range: [number, number]) => {
  // rest of function body
};
```

If you want to add more clarity to the tuple, you can add names for each of the types:

```ts
const setRange = (range: [x: number, y: number]) => {
  // rest of function body
};
```

#### Solution 4: Optional Members of Tuples

A good start would be to change the `coordinates` parameter to a tuple of `[number, number, number | undefined]`:

```tsx
const goToLocation = (coordinates: [number, number, number | undefined]) => {};
```

The problem here is that while the third member of the tuple is able to be a number or `undefined`, the function still is expecting something to be passed in. It's not a good solution to have to pass in `undefined` manually.

Using a named tuple in combination with the optional operator `?` is a better solution:

```tsx
const goToLocation = (
  coordinates: [latitude: number, longitude: number, elevation?: number]
) => {};
```

The values are clear, and using the `?` operator specifies the `elevation` is an optional number. It almost looks like an object, but it's still a tuple.

Alternatively, if you don't want to use named tuples, you can use the `?` operator after the definition:

```tsx
const goToLocation = (coordinates: [number, number, number?]) => {};
```

## Passing Types To Functions

Let's take a quick look back at the `Array` type we saw earlier.

```ts
Array<string>;
```

This type describes an array of strings. To make that happen, we're passing a type (`string`) as an argument to another type (`Array`).

There are lots of other types that can receive types, like `Promise<string>`, `Record<string, string>`, and others. In each of them, we use the angle brackets to pass a type to another type.

But we can also use that syntax to pass types to functions.

### Passing Types To `Set`

A `Set` is a JavaScript feature that represents a collection of unique values.

To create a `Set`, use the `new` keyword and call `Set`:

```ts twoslash
const formats = new Set();
//    ^?
```

If we hover over the `formats` variable, we can see that it is typed as `Set<unknown>`.

That's because the `Set` doesn't know what type it's supposed to be! We haven't passed it any values, so it defaults to an `unknown` type.

One way to have TypeScript know what type we want the `Set` to hold would be to pass in some initial values:

```ts twoslash
const formats = new Set(["CD", "DVD"]);
//    ^?
```

In this case, since we specified two strings when creating the `Set`, TypeScript knows that `formats` is a `Set` of strings.

But it's not always the case that we know exactly what values we want to pass to a `Set` when we create it. We might want to create an empty `Set` that we know will hold strings later on.

For this, we can pass a type to `Set` using the angle brackets syntax:

```ts
const formats = new Set<string>();
```

Now, `formats` understands that it's a set of strings, and adding anything other than a string will fail:

```ts twoslash
// @errors: 2345
const formats = new Set<string>();

// ---cut---
formats.add("Digital");

formats.add(8);
```

This is a really important thing to understand in TypeScript. You can pass types, as well as values, to functions.

### Not All Functions Can Receive Types

Most functions in TypeScript _can't_ receive types.

For example, let's look at `document.getElementById` that comes in from the DOM typings.

A common example where you might want to pass a type is when calling `document.getElementById`. Here we're trying to get an audio element:

```ts twoslash
const audioElement = document.getElementById("player");
```

We know that `audioElement` is going to be a `HTMLAudioElement`, so it seems like we should be able to pass it to `document.getElementById`:

```ts twoslash
// @errors: 2558
const audioElement = document.getElementById<HTMLAudioElement>("player");
```

But unfortunately, we can't. We get an error saying that `.getElementById` expects zero type arguments.

We can see whether a function can receive type arguments by hovering over it. Let's try hovering `.getElementById`:

```ts
// hovering over .getElementById shows:
(method) Document.getElementById(elementId: string): HTMLElement | null
```

Notice that `.getElementById` contains no angle brackets (`<>`) in its hover, which is why we can't pass a type to it.

Let's contrast it with a function that _can_ receive type arguments, like `document.querySelector`:

```ts
const audioElement = document.querySelector("#player");

// hovering over .querySelector shows:
(method) ParentNode.querySelector<Element>(selectors: string): Element | null
```

This type definition shows us that `.querySelector` has some angle brackets before the parentheses. Inside of the brackets is the default value inside them - in this case, `Element`.

So, to fix our code above we could replace `.getElementById` with `.querySelector` and use the `#player` selector to find the audio element:

```ts
const audioElement = document.querySelector<HTMLAudioElement>("#player");
```

And everything works.

So, to tell whether a function can receive a type argument, hover it and check whether it has any angle brackets.

### Exercises

#### Exercise 1: Passing Types to Map

Here we are creating a `Map`, a JavaScript feature which represents a dictionary.

In this case we want to pass in a number for the key, and an object for the value:

```ts twoslash
// @errors: 2578
const userMap = new Map();

userMap.set(1, { name: "Max", age: 30 });

userMap.set(2, { name: "Manuel", age: 31 });

// @ts-expect-error
userMap.set("3", { name: "Anna", age: 29 });

// @ts-expect-error
userMap.set(3, "123");
```

There are red lines on the `@ts-expect-error` directives because currently any type of key and value is allowed in the `Map`.

```ts
// hovering over Map shows:
var Map: MapConstructor

new () => Map<any, any> (+3 overloads)
```

How would we type the `userMap` so the key must be a number and the value is an object with `name` and `age` properties?

<Exercise title="Exercise 1: Passing Types to Map" filePath="/src/015-essential-types-and-annotations/036-pass-types-to-map.problem.ts" resourceId="YgFRxBViy44CfW0H2dTq1H"></Exercise>

#### Exercise 2: `JSON.parse()` Can't Receive Type Arguments

Consider the following code, which uses `JSON.parse` to parse some JSON:

```ts twoslash
// @errors: 2558
const parsedData = JSON.parse<{
  name: string;
  age: number;
}>('{"name": "Alice", "age": 30}');
```

There is currently an error under the type argument for `JSON.parse`.

A test that checks the type of `parsedData` is currently failing, since it is typed as `any` instead of the expected type:

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

declare const parsedData: any;

// ---cut---
type test = Expect<
  Equal<
    typeof parsedData,
    {
      name: string;
      age: number;
    }
  >
>;
```

We've tried to pass a type argument to the `JSON.parse` function. But it doesn't appear to be working in this case.

The test errors tell us that the type of `parsed` is not what we expect. The properties `name` and `age` are not being recognized.

Why this is happening? What would be an different way to correct these type errors?

<Exercise title="Exercise 2: `JSON.parse()` Can't Receive Type Arguments" filePath="/src/015-essential-types-and-annotations/037-json-parse-cant-receive-type-arguments.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAfD9"></Exercise>

#### Solution 1: Passing Types to Map

There are a few different ways to solve this problem, but we'll start with the most straightforward one.

The first thing to do is to create a `User` type:

```ts
type User = {
  name: string;
  age: number;
};
```

Following the patterns we've seen so far, we can pass `number` and `User` as the types for the `Map`:

```ts
const userMap = new Map<number, User>();
```

That's right - some functions can receive _multiple_ type arguments. In this case, the `Map` constructor can receive two types: one for the key, and one for the value.

With this change, the errors go away, and we can no longer pass in incorrect types into the `userMap.set` function.

You can also express the `User` type inline:

```ts
const userMap = new Map<number, { name: string; age: number }>();
```

#### Solution 2: `JSON.parse()` Can't Receive Type Arguments

Let's look a bit closer at the error message we get when passing a type argument to `JSON.parse`:

```
Expected 0 type arguments, but got 1.
```

This message indicates that TypeScript is not expecting anything inside the angle braces when calling `JSON.parse`. To resolve this error, we can remove the angle braces:

```ts
const parsedData = JSON.parse('{"name": "Alice", "age": 30}');
```

Now that `.parse` is receiving the correct number of type arguments, TypeScript is happy.

However, we want our parsed data to have the correct type. Hovering over `JSON.parse`, we can see its type definition:

```ts
JSON.parse(text: string, reviver?: ((this: any, key: string, value: any) => any)  undefined): any
```

It always returns `any`, which is a bit of a problem.

To get around this issue, we can give `parsedData` a variable type annotation with `name: string` and `age: number`:

```ts
const parsedData: {
  name: string;
  age: number;
} = JSON.parse('{"name": "Alice", "age": 30}');
```

Now we have `parsedData` typed as we want it to be.

The reason this works is because `any` disables type checking. So, we can assign it any type we want to. We could assign it something that doesn't make sense, like `number`, and TypeScript wouldn't complain:

```ts
const parsedData: number = JSON.parse('{"name": "Alice", "age": 30}');
```

So, this is more 'type faith' than 'type safe'. We are hoping that `parsedData` is the type we expect it to be. This relies on us keeping the type annotation up to date with the actual data.

## Typing Functions

### Optional Parameters

For cases where a function parameter is optional, we can add the `?` operator before the `:`.

Say we wanted to add an optional `releaseDate` parameter to the `logAlbumInfo` function. We could do so like this:

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean,
  releaseDate?: string
) => {
  // rest of function body
};
```

Now we can call `logAlbumInfo` and include a release date string, or leave it out:

```ts
logAlbumInfo("Midnights", 13, true, "2022-10-21");

logAlbumInfo("American Beauty", 10, true);
```

Hovering over the optional `releaseDate` parameter in VS Code will show us that it is now typed as `string | undefined`.

We'll discuss the `|` symbol more later, but this means that the parameter could either be a `string` or `undefined`. It would be acceptable to literally pass `undefined` as a second argument, or it can be omitted all together.

### Default Parameters

In addition to marking parameters as optional, you can set default values for parameters by using the `=` operator.

For example, we could set the `format` to default to `"CD"` if no format is provided:

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean,
  format: string = "CD"
) => {
  // rest of function body
};
```

The annotation of `: string` can also be omitted:

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean,
  format = "CD"
) => {
  // rest of function body
};
```

Since it can infer the type of the `format` parameter from the value provided. This is another nice example of type inference.

### Function Return Types

In addition to setting parameter types, we can also set the return type of a function.

The return type of a function can be annotated by placing a `:` and the type after the closing parentheses of the parameter list. For the `logAlbumInfo` function, we can specify that the function will return a string:

```ts
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
): string => {
  // rest of function body
};
```

If the value returned from a function doesn't match the type that was specified, TypeScript will show an error.

```ts twoslash
// @errors: 2322
const logAlbumInfo = (
  title: string,
  trackCount: number,
  isReleased: boolean
): string => {
  return 123;
};
```

Return types are useful for when you want to ensure that a function returns a specific type of value.

### Rest Parameters

Just like in JavaScript, TypeScript supports rest parameters by using the `...` syntax for the final parameter. This allows you to pass in any number of arguments to a function.

For example, this `printAlbumFormats` is set up to accept an `album` and any number of `formats`:

```ts
function getAlbumFormats(album: Album, ...formats: string[]) {
  return `${album.title} is available in the following formats: ${formats.join(
    ", "
  )}`;
}
```

Declaring the parameter with the `...formats` syntax combined with an array of strings lets us pass in any number of strings to the function:

```ts
getAlbumFormats(
  { artist: "Radiohead", title: "OK Computer", year: 1997 },
  "CD",
  "LP",
  "Cassette"
);
```

Or even by spreading in an array of strings:

```ts
const albumFormats = ["CD", "LP", "Cassette"];

getAlbumFormats(
  { artist: "Radiohead", title: "OK Computer", year: 1997 },
  ...albumFormats
);
```

As an alternative, we can use the `Array<>` syntax instead.

```ts
function getAlbumFormats(album: Album, ...formats: Array<string>) {
  // function body
}
```

### Function Types

We've used type annotations to specify the types of function parameters, but we can also use TypeScript to describe the types of functions themselves.

We can do this using this syntax:

```ts
type Mapper = (item: string) => number;
```

This is a type alias for a function that takes in a `string` and returns a `number`.

We could then use this to describe a callback function passed to another function:

```ts
const mapOverItems = (items: string[], map: Mapper) => {
  return items.map(map);
};
```

Or, declare it inline:

```ts
const mapOverItems = (items: string[], map: (item: string) => number) => {
  return items.map(map);
};
```

This lets us pass a function to `mapOverItems` that changes the value of the items in the array.

```ts
const arrayOfNumbers = mapOverItems(["1", "2", "3"], (item) => {
  return parseInt(item) * 100;
});
```

Function types are as flexible as function definitions. You can declare multiple parameters, rest parameters, and optional parameters.

```ts
// Optional parameters
type WithOptional = (index?: number) => number;

// Rest parameters
type WithRest = (...rest: string[]) => number;

// Multiple parameters
type WithMultiple = (first: string, second: string) => number;
```

### The `void` Type

Some functions don't return anything. They perform some kind of action, but they don't produce a value.

A great example is a `console.log`:

```ts
const logResult = console.log("Hello!");
```

What type do you expect `logResult` to be? In JavaScript, the value is `undefined`. If we were to `console.log(logResult)`, that's what we'd see in the console.

But TypeScript has a special type for these situations - where a function's return value should be deliberately ignored. It's called `void`.

If we hover over `.log` in `console.log`, we'll see that it returns `void`:

```
(method) Console.log(...data: any[]): void
```

So, `logResult` is also `void`.

This is TypeScript's way of saying "ignore the result of this function call".

### Typing Async Functions

We've looked at how to strongly type what a function returns, via a return type:

```ts
const getUser = (id: string): User => {
  // function body
};
```

But what about when the function is asynchronous?

```ts twoslash
// @errors: 1064 2355
type User = {
  id: string;
  name: string;
};
// ---cut---
const getUser = async (id: string): User => {
  // function body
};
```

Fortunately, TypeScript's error message is helpful here. It's telling us that the return type of an async function must be a `Promise`.

So, we can pass `User` to a `Promise`:

```ts
const getUser = async (id: string): Promise<User> => {
  const user = await db.users.get(id);

  return user;
};
```

Now, our function must return a `Promise` that resolves to a `User`.

### Exercises

#### Exercise 1: Optional Function Parameters

Here we have a `concatName` function, whose implementation takes in two `string` parameters `first` and `last`.

If there's no `last` name passed, the return would be just the `first` name. Otherwise, it would return `first` concatenated with `last`:

```ts
const concatName = (first: string, last: string) => {
  if (!last) {
    return first;
  }

  return `${first} ${last}`;
};
```

When calling `concatName` with a first and last name, the function works as expected without errors:

```ts
const result = concatName("John", "Doe");
```

However, when calling `concatName` with just a first name, we get an error:

```ts twoslash
// @errors: 2554
const concatName = (first: string, last: string) => {
  if (!last) {
    return first;
  }

  return `${first} ${last}`;
};
// ---cut---
const result2 = concatName("John");
```

Try to use an optional parameter annotation to fix the error.

<Exercise title="Exercise 1: Optional Function Parameters" filePath="/src/015-essential-types-and-annotations/023-optional-function-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdVv"></Exercise>

#### Exercise 2: Default Function Parameters

Here we have the same `concatName` function as before, where the `last` name is optional:

```ts twoslash
const concatName = (first: string, last?: string) => {
  if (!last) {
    return first;
  }

  return `${first} ${last}`;
};
```

We also have a couple of tests. This test checks that the function returns the full name when passed a first and last name:

```ts
it("should return the full name", () => {
  const result = concatName("John", "Doe");

  type test = Expect<Equal<typeof result, string>>;

  expect(result).toEqual("John Doe");
});
```

However, the second test expects that when `concatName` is called with just a first name as an argument, the function should use `Pocock` as the default last name:

```ts
it("should return the first name", () => {
  const result = concatName("John");

  type test = Expect<Equal<typeof result, string>>;

  expect(result).toEqual("John Pocock");
});
```

This test currently fails, with the output from `vitest` indicating the error is on the `expect` line:

```
AssertionError: expected 'John' to deeply equal 'John Pocock'

- Expected

+ Received

— John Pocock

+ John

expect(result).toEqual("John Pocock");
```

Update the `concatName` function to use `Pocock` as the default last name if one is not provided.

<Exercise title="Exercise 2: Default Function Parameters" filePath="/src/015-essential-types-and-annotations/024-default-function-parameters.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAdoi"></Exercise>

#### Exercise 3: Rest Parameters

Here we have a `concatenate` function that takes in a variable number of strings:

```ts twoslash
// @errors: 7019
export function concatenate(...strings) {
  return strings.join("");
}
```

The test passes, but there's an error on the `...strings` rest parameter.

How would you update the rest parameter to specify that it should be an array of strings?

<Exercise title="Exercise 3: Rest Parameters" filePath="/src/015-essential-types-and-annotations/030-rest-parameters.problem.ts" resourceId="jUJqrXCHRph0Z4Fs6Ll6T5"></Exercise>

#### Exercise 4: Function Types

Here, we have a `modifyUser` function that takes in an array of `users`, an `id` of the user that we want to change, and a `makeChange` function that makes that change:

```ts twoslash
// @errors: 7006
type User = {
  id: string;
  name: string;
};

const modifyUser = (user: User[], id: string, makeChange) => {
  return user.map((u) => {
    if (u.id === id) {
      return makeChange(u);
    }

    return u;
  });
};
```

Currently there is an error under `makeChange`.

Here's an example of how this function would be called:

```ts twoslash
// @errors: 7006
type User = {
  id: string;
  name: string;
};

const modifyUser = (user: User[], id: string, makeChange) => {
  return user.map((u) => {
    if (u.id === id) {
      return makeChange(u);
    }

    return u;
  });
};

// ---cut---
const users: User[] = [
  { id: "1", name: "John" },
  { id: "2", name: "Jane" },
];

modifyUser(users, "1", (user) => {
  return { ...user, name: "Waqas" };
});
```

In the above example, the `user` parameter to the error function also has the "implicit `any`" error.

The `modifyUser` type annotation for the `makeChange` function to be updated. It should return a modified user. For example, we should not be able to return a `name` of `123`, because in the `User` type, `name` is a `string`:

```ts
modifyUser(
  users,
  "1",
  // @ts-expect-error
  (user) => {
    return { ...user, name: 123 };
  }
);
```

How would you type `makeChange` as a function takes in a `User` and returns a `User`?

<Exercise title="Exercise 4: Function Types" filePath="/src/015-essential-types-and-annotations/033-function-types.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAeqb"></Exercise>

#### Exercise 5: Functions Returning `void`

Here we explore a classic web development example.

We have an `addClickEventListener` function that takes in a listener function and adds it to the document:

```ts twoslash
// @errors: 7006
const addClickEventListener = (listener) => {
  document.addEventListener("click", listener);
};

addClickEventListener(() => {
  console.log("Clicked!");
});
```

Currently there is an error under `listener` because it doesn't have a type signature.

We're also _not_ getting an error when we pass an incorrect value to `addClickEventListener`.

```ts twoslash
// @errors: 7006 2578
const addClickEventListener = (listener) => {
  document.addEventListener("click", listener);
};

// ---cut---
addClickEventListener(
  // @ts-expect-error
  "abc"
);
```

This is triggering our `@ts-expect-error` directive.

How should `addClickEventListener` be typed so that each error is resolved?

<Exercise title="Exercise 5: Functions Returning `void`" filePath="/src/015-essential-types-and-annotations/034-functions-returning-void.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAf1s"></Exercise>

#### Exercise 6: `void` vs `undefined`

We've got a function that accepts a callback and calls it. The callback doesn't return anything, so we've typed it as `() => undefined`:

```ts
const acceptsCallback = (callback: () => undefined) => {
  callback();
};
```

But we're getting an error when we try to pass in `returnString`, a function that _does_ return something:

```ts twoslash
// @errors: 2345
const acceptsCallback = (callback: () => undefined) => {
  callback();
};

// ---cut---
const returnString = () => {
  return "Hello!";
};

acceptsCallback(returnString);
```

Why is this happening? Can we alter the type of `acceptsCallback` to fix this error?

<Exercise title="Exercise 6: `void` vs `undefined`" filePath="/src/015-essential-types-and-annotations/034.5-void-vs-undefined.problem.ts"></Exercise>

#### Exercise 7: Typing Async Functions

This `fetchData` function awaits the `response` from a call to `fetch`, then gets the `data` by calling `response.json()`:

```ts
async function fetchData() {
  const response = await fetch("https://api.example.com/data");

  const data = await response.json();

  return data;
}
```

There are a couple of things worth noting here.

Hovering over `response`, we can see that it has a type of `Response`, which is a globally available type:

```ts
// hovering over response
const response: Response;
```

When hovering over `response.json()`, we can see that it returns a `Promise<any>`:

```ts
// hovering over response.json()

const response.json(): Promise<any>
```

If we were to remove the `await` keyword from the call to `fetch`, the return type would also become `Promise<any>`:

```ts
const response = fetch("https://api.example.com/data");

// hovering over response shows

const response: Promise<any>;
```

Consider this `example` and its test:

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

async function fetchData() {
  const response = await fetch("https://api.example.com/data");

  const data = await response.json();

  return data;
}

// ---cut---
const example = async () => {
  const data = await fetchData();

  type test = Expect<Equal<typeof data, number>>;
};
```

The test is currently failing because `data` is typed as `any` instead of `number`.

How can we type `data` as a number without changing the calls to `fetch` or `response.json()`?

There are two possible solutions here.

<Exercise title="Exercise 7: Typing Async Functions" filePath="/src/015-essential-types-and-annotations/038-type-async-functions.problem.ts" resourceId="1fZdJK1AI9JNeRElmqAfhD"></Exercise>

#### Solution 1: Optional Function Parameters

By adding a question mark `?` to the end of a parameter, it will be marked as optional:

```ts
function concatName(first: string, last?: string) {
  // ...implementation
}
```

#### Solution 2: Default Function Parameters

To add a default parameter in TypeScript, we would use the `=` syntax that is also used in JavaScript.

In this case, we will update `last` to default to "Pocock" if no value is provided:

```ts twoslash
// @errors: 1015
export const concatName = (first: string, last?: string = "Pocock") => {
  return `${first} ${last}`;
};
```

While this passes our runtime tests, it actually fails in TypeScript.

This is because TypeScript doesn't allow us to have both an optional parameter and a default value. The optionality is already implied by the default value.

To fix the error, we can remove the question mark from the `last` parameter:

```ts
export const concatName = (first: string, last = "Pocock") => {
  return `${first} ${last}`;
};
```

#### Solution 3: Rest Parameters

When using rest parameters, all of the arguments passed to the function will be collected into an array. This means that the `strings` parameter can be typed as an array of strings:

```ts
export function concatenate(...strings: string[]) {
  return strings.join("");
}
```

Or, of course, using the `Array<>` syntax:

```ts
export function concatenate(...strings: Array<string>) {
  return strings.join("");
}
```

#### Solution 4: Function Types

Let's start by annotating the `makeChange` parameter to be a function. For now, we'll specify that it returns `any`:

```ts twoslash
// @errors: 2554
type User = {
  id: string;
  name: string;
};

// ---cut---
const modifyUser = (user: User[], id: string, makeChange: () => any) => {
  return user.map((u) => {
    if (u.id === id) {
      return makeChange(u);
    }

    return u;
  });
};
```

With this first change in place, we get an error under `u` when calling `makeChange` since we said that `makeChange` takes in no arguments.

This tells us we need to add a parameter to the `makeChange` function type.

In this case, we will specify that `user` is of type `User`.

```ts
const modifyUser = (
  user: User[],
  id: string,
  makeChange: (user: User) => any
) => {
  // function body
};
```

This is pretty good, but we also need to make sure our `makeChange` function returns a `User`:

```ts
const modifyUser = (
  user: User[],
  id: string,
  makeChange: (user: User) => User
) => {
  // function body
};
```

Now the errors are resolved, and we have autocompletion for the `User` properties when writing a `makeChange` function.

Optionally, we can clean up the code a bit by creating a type alias for the `makeChange` function type:

```ts
type MakeChangeFunc = (user: User) => User;

const modifyUser = (user: User[], id: string, makeChange: MakeChangeFunc) => {
  // function body
};
```

Both techniques behave the same, but if you need to reuse the `makeChange` function type, a type alias is the way to go.

#### Solution 5: Functions Returning `void`

Let's start by annotating the `listener` parameter to be a function. For now, we'll specify that it returns a string:

```ts
const addClickEventListener = (listener: () => string) => {
  document.addEventListener("click", listener);
};
```

The problem is that we now have an error when we call `addClickEventListener` with a function that returns nothing:

```ts twoslash
// @errors: 2345
const addClickEventListener = (listener: () => string) => {
  document.addEventListener("click", listener);
};

// ---cut---
addClickEventListener(() => {
  console.log("Clicked!");
});
```

The error message tells us that the `listener` function is returning `void`, which is not assignable to `string`.

This suggests that instead of typing the `listener` parameter as a function that returns a string, we should type it as a function that returns `void`:

```ts
const addClickEventListener = (listener: () => void) => {
  document.addEventListener("click", listener);
};
```

This is a great way to tell TypeScript that we don't care about the return value of the `listener` function.

#### Solution 6: `void` vs `undefined`

The solution is to change the of `callback` to `() => void`:

```ts
const acceptsCallback = (callback: () => void) => {
  callback();
};
```

Now we can pass in `returnString` without any issues. This is because `returnString` returns a `string`, and `void` tells TypeScript to ignore the return value when comparing them.

So if you really don't care about the result of a function, you should type it as `() => void`.

#### Solution 7: Typing Async Functions

You might be tempted to try passing a type argument to `fetch`, similar to how you would with `Map` or `Set`.

However, hovering over `fetch`, we can see that it doesn't accept type arguments:

```ts
// @noErrors
const response = fetch<number>("https://api.example.com/data");
//               ^?
```

We also can't add a type annotation to `response.json()` because as it doesn't accept type arguments either:

```ts twoslash
// @errors: 2558
const response = await fetch("https://api.example.com/data");

// ---cut---
const data: number = await response.json<number>();
```

One thing that will work is to specify that `data` is a `number`:

```ts
const response = await fetch("https://api.example.com/data");

// ---cut---
const data: number = await response.json();
```

This works because `data` was `any` before, and `await response.json()` returns `any`. So now we're putting `any` into a slot that requires a `number`.

However, the best way to solve this problem is to add a return type to the function. In this case, it should be a `number`:

```ts twoslash
// @errors: 1064
async function fetchData(): number {
  // function body

  return 123;
}
```

Now `data` is typed as a `number`, except we have an error under our return type annotation.

So, we should change the return type to `Promise<number>`:

```ts twoslash
async function fetchData(): Promise<number> {
  const response = await fetch("https://api.example.com/data");

  const data = await response.json();

  return data;
}
```

By wrapping the `number` inside of `Promise<>`, we make sure that the `data` is awaited before the type is figured out.

# Chapter 2: Objects

So far, we've looked at object types only in the context of 'object literals', defined using `{}` with type aliases.

But TypeScript has many tools available that let you be more expressive with object types. You can model inheritance, create new object types from existing ones, and use dynamic keys.

## Extending Objects

Let's start our investigation by looking at how to build object types from _other object types_ in TypeScript.

### Intersection Types

An intersection type lets us combine multiple object types into a single type. It uses the `&` operator. You can think of it like the reverse of the `|` operator. Instead of representing an "or" relationship between types, the `&` operator signifies an "and" relationship.

Using the intersection operator `&` combines multiple separate types into a single type.

Consider these types for `Album` and `SalesData`:

```typescript
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

type SalesData = {
  unitsSold: number;
  revenue: number;
};
```

On their own, each type represents a distinct set of properties. While the `SalesData` type on its own could be used to represent sales data for any product, using the `&` operator to create an intersection type allows us to combine the two types into a single type that represents an album's sales data:

```typescript
type AlbumSales = Album & SalesData;
```

The `AlbumSales` type now requires objects to include all of the properties from both `AlbumDetails` and `SalesData`:

```typescript
const wishYouWereHereSales: AlbumSales = {
  title: "Wish You Were Here",
  artist: "Pink Floyd",
  releaseYear: 1975
  unitsSold: 13000000,
  revenue: 65000000,
};
```

If the contract of the `AlbumSales` type isn't fulfilled when creating a new object, TypeScript will raise an error.

It's also possible to intersect more than two types:

```typescript
type AlbumSales = Album & SalesData & { genre: string };
```

This is a useful method for creating new types from existing ones.

#### Intersection Types With Primitives

It's worth noting that intersection types can also be used with primitives, like `string` and `number` - though it often produces odd results.

For instance, let's try intersecting `string` and `number`:

```typescript
type StringAndNumber = string & number;
```

What type do you think `StringAndNumber` is? It's actually `never`. This is because `string` and `number` have innate properties that can't be combined together.

This also happens when you intersect two object types with an incompatible property:

```ts twoslash
type User1 = {
  age: number;
};

type User2 = {
  age: string;
};

type User = User1 & User2;
//   ^?
```

In this case, the `age` property resolves to `never` because it's impossible for a single property to be both a `number` and a `string`.

### Interfaces

So far, we've been only using the `type` keyword to define object types. Experienced TypeScript programmers will likely be tearing their hair out thinking "Why aren't we talking about interfaces?!".

Interfaces are one of TypeScript's most famous features. They shipped with the very first versions of TypeScript and are considered a core part of the language.

Interfaces let you declare object types using a slightly different syntax to `type`. Let's compare the syntax:

```typescript
type Album = {
  title: string;
  artist: string;
  releaseYear: number;
};

interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}
```

They're largely identical, except for the keyword and an equals sign. But it's a common mistake to think of them as interchangeable. They're not.

They have quite different capabilities, which we'll explore in this section.

### `interface extends`

One of `interface`'s most powerful features is its ability to extend other interfaces. This allows you to create new interfaces that inherit properties from existing ones.

In this example, we have a base `Album` interface that will be extended into `StudioAlbum` and `LiveAlbum` interfaces that allow us to provide more specific details about an album:

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
}

interface StudioAlbum extends Album {
  studio: string;
  producer: string;
}

interface LiveAlbum extends Album {
  concertVenue: string;
  concertDate: Date;
}
```

This structure allows us to create more specific album representations with a clear inheritance relationship:

```typescript
const americanBeauty: StudioAlbum = {
  title: "American Beauty",
  artist: "Grateful Dead",
  releaseYear: 1970,
  studio: "Wally Heider Studios",
  producer: "Grateful Dead and Stephen Barncard",
};

const oneFromTheVault: LiveAlbum = {
  title: "One from the Vault",
  artist: "Grateful Dead",
  releaseYear: 1991,
  concertVenue: "Great American Music Hall",
  concertDate: new Date("1975-08-13"),
};
```

Just as adding additional `&` operators add to an intersection, it's also possible for an interface to extend multiple other interfaces by separating them with commas:

```typescript
interface BoxSet extends StudioAlbum, LiveAlbum {
  numberOfDiscs: number;
}
```

### Intersections vs `interface extends`

We've now covered two separate TypeScript syntaxes for extending object types: `&` and `interface extends`. So, which is better?

You should choose `interface extends` for two reasons.

#### Better Errors When Merging Incompatible Types

We saw earlier that when you intersect two object types with an incompatible property, TypeScript will resolve the property to `never`:

```typescript
type User1 = {
  age: number;
};

type User2 = {
  age: string;
};

type User = User1 & User2;
```

When using `interface extends`, TypeScript will raise an error when you try to extend an interface with an incompatible property:

```ts twoslash
// @errors: 2430
interface User1 {
  age: number;
}

interface User extends User1 {
  age: string;
}
```

This is very different because it actually sources an error. With intersections, TypeScript will only raise an error when you try to access the `age` property, not when you define it.

So, `interface extends` is better for catching errors when building out your types.

#### Better TypeScript Performance

When you're working in TypeScript, the performance of your types should be at the back of your mind. In large projects, how you define your types can have a big impact on how fast your IDE feels, and how long it takes for `tsc` to check your code.

`interface extends` is much better for TypeScript performance than intersections. With intersections, the intersection is recomputed every time it's used. This can be slow, especially when you're working with complex types.

Interfaces are faster. TypeScript can cache the resulting type of an interface based on its name. So if you use `interface extends`, TypeScript only has to compute the type once, and then it can reused it every time you use the interface.

#### Conclusion

`interface extends` is better for catching errors and for TypeScript performance. This doesn't mean you need to define all your object types using `interface` - we'll get to that later. But if you need to make one object type extend another, you should use `interface extends` where possible.

### Types vs Interfaces

Now we know how good `interface extends` is for extending object types, a natural question arises. Should we use `interface` for all our types by default?

Let's look at a few comparison points between types and interfaces.

#### Types Can be Anything

Type aliases are a lot more flexible than interfaces. A `type` can represent anything – union types, object types, intersection types, and more.

```typescript
type Union = string | number;
```

When we declare a type alias, we're just giving a name (or alias) to an existing type.

On the other hand, an `interface` can only represent object types (and functions, which we'll look at much later).

#### Declaration Merging

Interfaces in TypeScript have an odd property. When multiple interfaces with the same name in the same scope are created, TypeScript automatically merges them. This is known as declaration merging.

Here's an example of an `Album` interface with properties for the `title` and `artist`:

```typescript
interface Album {
  title: string;
  artist: string;
}
```

But let's imagine that, in the same file, you accidentally declare another `Album` interface with properties for the `releaseYear` and `genres`:

```typescript
interface Album {
  title: string;
  artist: string;
}

interface Album {
  releaseYear: number;
  genres: string[];
}
```

TypeScript automatically merges these two declarations into a single interface that includes all of the properties from both declarations:

```typescript
// Under the hood:
interface Album {
  title: string;
  artist: string;
  releaseYear: number;
  genres: string[];
}
```

This is very different from `type`, which would give you an error if you tried to declare the same type twice:

```ts twoslash
// @errors: 2300
type Album = {
  title: string;
  artist: string;
};

type Album = {
  releaseYear: number;
  genres: string[];
};
```

Coming from a JavaScript point of view, this behavior of interfaces feels pretty weird. I have lost hours of my life to having two interfaces with the same name in the same 2,000+ line file. It's there for a good reason - that we'll explore in a later chapter - but it's a bit of a gotcha.

Declaration merging, and its somewhat unexpected behavior, makes me a little wary of using interfaces.

#### Conclusion

So, should you use `type` or `interface` for declaring simple object types?

I tend to default to `type` unless I need to use `interface extends`. This is because `type` is more flexible and doesn't declaration merge unexpectedly.

But, it's a close call. I wouldn't blame you for going the opposite way. Many folks coming from a more object-oriented background will prefer `interface` because it's more familiar to them from other languages.

### Exercises

#### Exercise 1: Create an Intersection Type

Here we have a `User` type and a `Product` type, both with some common properties like `id` and `createdAt`:

```typescript
type User = {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
};

type Product = {
  id: string;
  createdAt: Date;
  name: string;
  price: number;
};
```

Your task is to create a new `BaseEntity` type that includes the `id` and `createdAt` properties. Then, use the `&` operator to create `User` and `Product` types that intersect with `BaseEntity`.

<Exercise title="Exercise 1: Create an Intersection Type" filePath="/src/020-objects/081-extend-object-using-intersections.problem.ts"></Exercise>

#### Exercise 2: Extending Interfaces

After the previous exercise, you'll have a `BaseEntity` type along with `User` and `Product` types that intersect with it.

This time, your task is to refactor the types to be interfaces, and use the `extends` keyword to extend the `BaseEntity` type. For extra credit, try creating and extending multiple smaller interfaces.

<Exercise title="Exercise 2: Extending Interfaces" filePath="/src/020-objects/082-extend-object-using-interfaces.problem.ts"></Exercise>

#### Solution 1: Create an Intersection Type

To solve this challenge, we'll create a new `BaseEntity` type with the common properties:

```typescript
type BaseEntity = {
  id: string;
  createdAt: Date;
};
```

Once the `BaseEntity` type is created, we can intersect it with the `User` and `Product` types:

```typescript
type User = {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
} & BaseEntity;

type Product = {
  id: string;
  createdAt: Date;
  name: string;
  price: number;
} & BaseEntity;
```

Then, we can remove the common properties from `User` and `Product`:

```typescript
type User = {
  name: string;
  email: string;
} & BaseEntity;

type Product = {
  name: string;
  price: number;
} & BaseEntity;
```

Now `User` and `Product` have exactly the same behavior that they did before, but with less duplicated code.

#### Solution 2: Extending Interfaces

Instead of using the `type` keyword, the `BaseEntity`, `User`, and `Product`, can be declared as interfaces. Remember, interfaces do not use an equals sign like `type` does:

```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
}

interface User {
  name: string;
  email: string;
}

interface Product {
  name: string;
  price: number;
}
```

Once the interfaces are created, we can use the `extends` keyword to extend the `BaseEntity` interface:

```typescript
interface User extends BaseEntity {
  name: string;
  email: string;
}

interface Product extends BaseEntity {
  name: string;
  price: number;
}
```

For the extra credit, we can take this further by creating `WithId` and `WithCreatedAt` interfaces that represent objects with an `id` and `createdAt` property. Then, we can have `User` and `Product` extend from these interfaces by adding commas:

```typescript
interface WithId {
  id: string;
}

interface WithCreatedAt {
  createdAt: Date;
}

interface User extends WithId, WithCreatedAt {
  name: string;
  email: string;
}

interface Product extends WithId, WithCreatedAt {
  name: string;
  price: number;
}
```

We've now refactored our intersections to use `interface extends` - our TypeScript compiler will thank us.

## Dynamic Object Keys

When using objects, it's common that we won't always know the exact keys that will be used.

In JavaScript, we can start with an empty object and add keys and values to it dynamically:

```typescript
// JavaScript Example
const albumAwards = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

However, when we try to add keys dynamically to an object in TypeScript, we'll get errors:

```ts twoslash
// @errors: 2339
// TypeScript Example
const albumAwards = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

This can feel unhelpful. You might think that TypeScript, based on its ability to narrow our code, should be able to figure out that we're adding keys to an object.

In this case, TypeScript prefers to be conservative. It's not going to let you add keys to an object that it doesn't know about. This is because TypeScript is trying to prevent you from making a mistake.

We need to tell TypeScript that we want to be able to dynamically add keys. Let's look at some ways to do this.

### Index Signatures for Dynamic Keys

Let's take another look at the code above.

```ts twoslash
// @errors: 2339
const albumAwards = {};

albumAwards.Grammy = true;
```

The technical term for what we're doing here is 'indexing'. We're indexing into `albumAwards` with a string key, `Grammy`, and assigning it a value.

To support this behavior, we want to tell TypeScript that whenever we try to index into `albumAwards` with a string, we should expect a boolean value.

To do that, we can use an 'index signature'.

Here's how we would specify an index signature for the `albumAwards` object.

```typescript
const albumAwards: {
  [index: string]: boolean;
} = {};

albumAwards.Grammy = true;
albumAwards.MercuryPrize = false;
albumAwards.Billboard = true;
```

The `[index: string]: boolean` syntax is an index signature. It tells TypeScript that `albumAwards` can have any string key, and the value will always be a boolean.

We can choose any name for the `index`. It's just a description.

```typescript
const albumAwards: {
  [iCanBeAnything: string]: boolean;
} = {};
```

The same syntax can also be used with types and interfaces:

```typescript
interface AlbumAwards {
  [index: string]: boolean;
}

const beyonceAwards: AlbumAwards = {
  Grammy: true,
  Billboard: true,
};
```

Index signatures are one way to handle dynamic keys. But there's a utility type that some argue is even better.

### Using a Record Type for Dynamic Keys

The `Record` utility type is another option for supporting dynamic keys.

Here's how we would use `Record` for the `albumAwards` object, where the key will be a string and the value will be a boolean:

```typescript
const albumAwards: Record<string, boolean> = {};

albumAwards.Grammy = true;
```

The first type argument is the key, and the second type argument is the value. This is a more concise way to achieve a similar result as an index signature.

`Record` can also support a union type as keys, but an index signature can't:

```ts twoslash
// @errors: 1337
const albumAwards1: Record<"Grammy" | "MercuryPrize" | "Billboard", boolean> = {
  Grammy: true,
  MercuryPrize: false,
  Billboard: true,
};

const albumAwards2: {
  [index: "Grammy" | "MercuryPrize" | "Billboard"]: boolean;
} = {
  Grammy: true,
  MercuryPrize: false,
  Billboard: true,
};
```

Index signatures can't use literal types, but `Record` can. We'll look at why this is when we explore mapped types in a later chapter.

The `Record` type helper is a repeatable pattern that's easy to read and understand, and is a bit more flexible than an index signature. It's my go-to for dynamic keys.

### Combining Known and Dynamic Keys

In many cases there will be a base set of keys we know we want to include, but we also want to allow for additional keys to be added dynamically.

For example, say we are working with a base set of awards we know were nominations, but we don't know what other awards are in play. We can use the `Record` type to define a base set of awards and then use an intersection to extend it with an index signature for additional awards:

```typescript
type BaseAwards = "Grammy" | "MercuryPrize" | "Billboard";

type ExtendedAlbumAwards = Record<BaseAwards, boolean> & {
  [award: string]: boolean;
};

const extendedNominations: ExtendedAlbumAwards = {
  Grammy: true,
  MercuryPrize: false,
  Billboard: true, // Additional awards can be dynamically added
  "American Music Awards": true,
};
```

This technique would also work when using an interface and the `extends` keyword:

```typescript
interface BaseAwards {
  Grammy: boolean;
  MercuryPrize: boolean;
  Billboard: boolean;
}

interface ExtendedAlbumAwards extends BaseAwards {
  [award: string]: boolean;
}
```

This version is preferable because, in general, `interface extends` is preferable to intersections.

Being able to support both default and dynamic keys in our data structures allows a lot of flexibility to adapt to changing requirements in your applications.

### `PropertyKey`

A useful type to know about when working with dynamic keys is `PropertyKey`.

The `PropertyKey` type is a global type that represents the set of all possible keys that can be used on an object, including string, number, and symbol. You can find its type definition inside of TypeScript's ES5 type definitions file:

```typescript
// inside lib.es5.d.ts
declare type PropertyKey = string | number | symbol;
```

Because `PropertyKey` works with all possible keys, it's great for working with dynamic keys where you aren't sure what the type of the key will be.

For example, when using an index signature you could set the key type to `PropertyKey` in order to allow for any valid key type:

```typescript
type Album = {
  [key: PropertyKey]: string;
};
```

### `object`

Similar to `string`, `number`, and `boolean`, `object` is a global type in TypeScript.

It represents more types than you might expect. Instead of representing only objects like `{}` or `new Object()`, `object` represents any non-primitive type. This includes arrays, functions, and objects.

So a function like this:

```typescript
function acceptAllNonPrimitives(obj: object) {}
```

Would accept any non-primitive value:

```typescript
acceptAllNonPrimitives({});
acceptAllNonPrimitives([]);
acceptAllNonPrimitives(() => {});
```

But error on primitives:

```ts twoslash
// @errors: 2345
function acceptAllNonPrimitives(obj: object) {}

// ---cut---
acceptAllNonPrimitives(1);
acceptAllNonPrimitives("hello");
acceptAllNonPrimitives(true);
```

This means that the `object` type is rarely useful by itself. Using `Record` is usually a better choice. For instance, if you want to accept any object type, you can use `Record<string, unknown>`.

### Exercises

#### Exercise 1: Use an Index Signature for Dynamic Keys

Here we have an object called `scores`, and we are trying to assign several different properties to it:

```ts twoslash
// @errors: 2339
const scores = {};

scores.math = 95;
scores.english = 90;
scores.science = 85;
```

Your task is to give `scores` a type annotation to support the dynamic subject keys. There are three ways: an inline index signature, a type, an interface, or a `Record`.

<Exercise title="Exercise 1: Use an Index Signature for Dynamic Keys" filePath="/src/020-objects/084-index-signatures.problem.ts"></Exercise>

#### Exercise 2: Default Properties with Dynamic Keys

Here, we're trying to model a situation where we want some required keys - `math`, `english`, and `science` - on our scores object.

But we also want to add dynamic properties. In this case, `athletics`, `french`, and `spanish`:

```ts twoslash
// @errors: 2578 2339
interface Scores {}

// @ts-expect-error science should be provided
const scores: Scores = {
  math: 95,
  english: 90,
};

scores.athletics = 100;
scores.french = 75;
scores.spanish = 70;
```

The definition of scores should be erroring, because `science` is missing - but it's not, because our definition of `Scores` is currently an empty object.

Your task is to update the `Scores` interface to specify default keys for `math`, `english`, and `science` while allowing for any other subject to be added. Once you've updated the type correctly, the red squiggly line below `@ts-expect-error` will go away because `science` will be required but missing. See if you can use `interface extends` to achieve this.

<Exercise title="Exercise 2: Default Properties with Dynamic Keys" filePath="/src/020-objects/085-index-signatures-with-defined-keys.problem.ts"></Exercise>

#### Exercise 3: Restricting Object Keys With Records

Here we have a `configurations` object, typed as `Configurations` which is currently unknown.

The object holds keys for `development`, `production`, and `staging`, and each respective key is associated with configuration details such as `apiBaseUrl` and `timeout`.

There is also a `notAllowed` key, which is decorated with a `@ts-expect-error` comment. But currently, this is not erroring in TypeScript as expected.

```ts twoslash
// @errors: 2578
type Environment = "development" | "production" | "staging";

type Configurations = unknown;

const configurations: Configurations = {
  development: {
    apiBaseUrl: "http://localhost:8080",
    timeout: 5000,
  },
  production: {
    apiBaseUrl: "https://api.example.com",
    timeout: 10000,
  },
  staging: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
  },
  // @ts-expect-error
  notAllowed: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
  },
};
```

Update the `Configurations` type so that only the keys from `Environment` are allowed on the `configurations` object. Once you've updated the type correctly, the red squiggly line below `@ts-expect-error` will go away because `notAllowed` will be disallowed properly.

<Exercise title="Exercise 3: Restricting Object Keys With Records" filePath="/src/020-objects/087-record-type-with-union-as-keys.problem.ts"></Exercise>

#### Exercise 4: Dynamic Key Support

Consider this `hasKey` function that accepts an object and a key, then calls `object.hasOwnProperty` on that object:

```typescript
const hasKey = (obj: object, key: string) => {
  return obj.hasOwnProperty(key);
};
```

There are several test cases for this function:

The first test case checks that it works on string keys, which doesn't present any issues. As anticipated, `hasKey(obj, "foo")` would return true and `hasKey(obj, "bar")` would return false:

```typescript
it("Should work on string keys", () => {
  const obj = {
    foo: "bar",
  };

  expect(hasKey(obj, "foo")).toBe(true);
  expect(hasKey(obj, "bar")).toBe(false);
});
```

A test case that checks for numeric keys does have issues because the function is expecting a string key:

```ts twoslash
// @errors: 2345

const hasKey = (obj: object, key: string) => {
  return obj.hasOwnProperty(key);
};

// ---cut---
const obj = {
  1: "bar",
};
```

Because an object can also have a symbol as a key, there is also a test for that case. It currently has type errors for `fooSymbol` and `barSymbol` when calling `hasKey`:

```ts twoslash
// @lib: dom,es2023,dom.iterable
// @errors: 2345
const hasKey = (obj: object, key: string) => {
  return obj.hasOwnProperty(key);
};

// ---cut---
const fooSymbol = Symbol("foo");
const barSymbol = Symbol("bar");

const obj = {
  [fooSymbol]: "bar",
};
```

Your task is to update the `hasKey` function so that all of these tests pass. Try to be as concise as possible!

<Exercise title="Exercise 4: Dynamic Key Support" filePath="/src/020-objects/086-property-key-type.problem.ts"></Exercise>

#### Solution 1: Use an Index Signature for Dynamic Keys

Here are the three solutions:

You can use an inline index signature:

```typescript
const scores: {
  [key: string]: number;
} = {};
```

Or an interface:

```typescript
interface Scores {
  [key: string]: number;
}
```

Or a type:

```typescript
type Scores = {
  [key: string]: number;
};
```

Or finally, a record:

```typescript
const scores: Record<string, number> = {};
```

#### Solution 2: Default Properties with Dynamic Keys

Here's how to add an index signature to the `Scores` interface to support dynamic keys along with the required keys:

```typescript
interface Scores {
  [subject: string]: number;
  math: number;
  english: number;
  science: number;
}
```

Creating a `RequiredScores` interface and extending it looks like this:

```typescript
interface RequiredScores {
  math: number;
  english: number;
  science: number;
}

interface Scores extends RequiredScores {
  [key: string]: number;
}
```

These two are functionally equivalent, except for the fact that you get access to the `RequiredScores` interface if you need to use that seprately.

#### Solution 3: Restricting Object Keys

##### A Failed First Attempt at Using Record

We know that the values of the `Configurations` object will be `apiBaseUrl`, which is a string, and `timeout`, which is a number.

It may be tempting to use a Record to set the key as a string and the value an object with the properties `apiBaseUrl` and `timeout`:

```typescript
type Configurations = Record<
  string,
  {
    apiBaseUrl: string;
    timeout: number;
  }
>;
```

However, having the key as `string` still allows for the `notAllowed` key to be added to the object. We need to make the keys dependent on the `Environment` type.

##### The Correct Approach

Instead, we can specify the `key` as `Environment` inside the Record:

```typescript
type Configurations = Record<
  Environment,
  {
    apiBaseUrl: string;
    timeout: number;
  }
>;
```

Now TypeScript will throw an error when the object includes a key that doesn't exist in `Environment`, like `notAllowed`.

#### Solution 4: Dynamic Key Support

The obvious answer is to change the `key`'s type to `string | number | symbol`:

```typescript
const hasKey = (obj: object, key: string | number | symbol) => {
  return obj.hasOwnProperty(key);
};
```

However, there's a much more succinct solution.

Hovering over `hasOwnProperty` shows us the type definition:

```typescript
(method) Object.hasOwnProperty(v: PropertyKey): boolean
```

Recall that the `PropertyKey` type represents every possible value a key can have. This means we can use it as the type for the key parameter:

```typescript
const hasKey = (obj: object, key: PropertyKey) => {
  return obj.hasOwnProperty(key);
};
```

Beautiful.

## Reducing Duplication with Utility Types

When working with object types in TypeScript, you'll often find yourself in situations where your object types share common properties. This can lead to a lot of duplicated code.

We've seen how using `interface extends` can help us model inheritance, but TypeScript also gives us tools to directly manipulate object types. With its built-in utility types, we can remove properties from types, make them optional, and more.

### `Partial`

The Partial utility type lets you create a new object type from an existing one, except all of its properties are optional.

Consider an Album interface that contains detailed information about an album:

```typescript
interface Album {
  id: number;
  title: string;
  artist: string;
  releaseYear: number;
  genre: string;
}
```

When we want to update an album's information, we might not have all the information at once. For example, it can be difficult to decide what genre to assign to an album before it's released.

Using the `Partial` utility type and passing in `Album`, we can create a type that allows us to update any subset of an album's properties:

```typescript
type PartialAlbum = Partial<Album>;
```

Now we have a `PartialAlbum` type where `id`, `title`, `artist`, `releaseYear`, and `genre` are all optional.

This means we can create a function which only receives a subset of the album's properties:

```typescript
const updateAlbum = (album: PartialAlbum) => {
  // ...
};

updateAlbum({ title: "Geogaddi", artist: "Boards of Canada" });
```

### `Required`

On the opposite side of `Partial` is the `Required` type, which makes sure all of the properties of a given object type are required.

This `Album` interface has the `releaseYear` and `genre` properties marked as optional:

```typescript
interface Album {
  title: string;
  artist: string;
  releaseYear?: number;
  genre?: string;
}
```

We can use the `Required` utility type to create a new `RequiredAlbum` type:

```typescript
type RequiredAlbum = Required<Album>;
```

With `RequiredAlbum`, all of the original `Album` properties become required, and omitting any of them would result in an error:

```typescript
const doubleCup: RequiredAlbum = {
  title: "Double Cup",
  artist: "DJ Rashad",
  releaseYear: 2013,
  genre: "Juke",
};
```

#### Required with Nested Properties

An important thing to note is that both `Required` and `Partial` only work one level deep. For example, if the `Album`'s `genre` contained nested properties, `Required<Album>` would not make the children required:

```ts twoslash
type Album = {
  title: string;
  artist: string;
  releaseYear?: number;
  genre?: {
    parentGenre?: string;
    subGenre?: string;
  };
};

type RequiredAlbum = Required<Album>;
//   ^?
```

If you find yourself in a situation where you need a deeply Required type, check out the type-fest library by Sindre Sorhus.

### `Pick`

The Pick utility type allows you to create a new object type by picking certain properties from an existing object.

For example, say we want to create a new type that only includes the `title` and `artist` properties from the `Album` type:

```typescript
type AlbumData = Pick<Album, "title" | "artist">;
```

This results in `AlbumData` being a type that only includes the `title` and `artist` properties.

This is extremely useful when you want to have one object that relies on the shape of another object. We'll explore this more in the chapter on deriving types from other types.

### `Omit`

The Omit helper type is kind of like the opposite of Pick. It allows you to create a new type by excluding a subset of properties from an existing type.

For example, we could use Omit to create the same `AlbumData` type we created with Pick, but this time by excluding the `id`, `releaseYear` and `genre` properties:

```typescript
type AlbumData = Omit<Album, "id" | "releaseYear" | "genre">;
```

A common use case is to create a type without `id`, for situations where the `id` has not yet been assigned:

```typescript
type AlbumData = Omit<Album, "id">;
```

This means that as `Album` gains more properties, they will flow down to `AlbumData` too.

On the surface, using Omit is straightforward, but there is a small quirk to be aware of.

#### Omit is Looser than Pick

When using Omit, you are able to exclude properties that don't exist on an object type.

For example, creating an `AlbumWithoutProducer` type with our `Album` type would not result in an error, even though `producer` doesn't exist on `Album`:

```typescript
type Album = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  genre: string;
};

type AlbumWithoutProducer = Omit<Album, "producer">;
```

If we tried to create an `AlbumWithOnlyProducer` type using Pick, we would get an error because `producer` doesn't exist on `Album`:

```ts twoslash
// @errors: 2344
type Album = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  genre: string;
};

type AlbumWithoutProducer = Omit<Album, "producer">;

// ---cut---
type AlbumWithOnlyProducer = Pick<Album, "producer">;
```

Why do these two utility types behave differently?

When the TypeScript team was originally implementing Omit, they were faced with a decision to create a strict or loose version of Omit. The strict version would only permit the omission of valid keys (`id`, `title`, `artist`, `releaseYear`, `genre`), whereas the loose version wouldn't have this constraint.

At the time, it was a more popular idea in the community to implement a loose version, so that's the one they went with. Given that global types in TypeScript are globally available and don't require an import statement, the looser version is seen as a safer choice, as it is more compatible and less likely to cause unforeseen errors.

While it is possible to create a strict version of Omit, the loose version should be sufficient for most cases. Just keep an eye out, since it may error in ways you don't expect.

We'll implement a strict version of Omit later in this book.

For more insights into the decisions behind Omit, refer to the TypeScript team's original [discussion](https://github.com/microsoft/TypeScript/issues/30455) and [pull request](https://github.com/microsoft/TypeScript/pull/30552) adding `Omit`, and their [final note](https://github.com/microsoft/TypeScript/issues/30825#issuecomment-523668235) on the topic.

### Omit And Pick Don't Work Well With Union Types

`Omit` and `Pick` have some odd behaviour when used with union types. Let's look at an example to see what I mean.

Consider a scenario where we have three interface types for `Album`, `CollectorEdition`, and `DigitalRelease`:

```typescript
type Album = {
  id: string;
  title: string;
  genre: string;
};

type CollectorEdition = {
  id: string;
  title: string;
  limitedEditionFeatures: string[];
};

type DigitalRelease = {
  id: string;
  title: string;
  digitalFormat: string;
};
```

These types share two common properties - `id` and `title` - but each also has unique attributes. The `Album` type includes `genre`, the `CollectorEdition` includes `limitedEditionFeatures`, and `DigitalRelease` has `digitalFormat`:

After creating a `MusicProduct` type that is a union of these three types, say we want to create a `MusicProductWithoutId` type, mirroring the structure of `MusicProduct` but excluding the `id` field:

```typescript
type MusicProduct = Album | CollectorEdition | DigitalRelease;

type MusicProductWithoutId = Omit<MusicProduct, "id">;
```

You might assume that `MusicProductWithoutId` would be a union of the three types minus the `id` field. However, what we get instead is a simplified object type containing only `title` – the other properties that were shared across all types, without `id`.

```typescript
// Expected:
type MusicProductWithoutId =
  | Omit<Album, "id">
  | Omit<CollectorEdition, "id">
  | Omit<DigitalRelease, "id">;

// Actual:
type MusicProductWithoutId = {
  title: string;
};
```

This is particularly annoying given that `Partial` and `Required` work as expected with union types:

```typescript
type PartialMusicProduct = Partial<MusicProduct>;

// Hovering over PartialMusicProduct shows:
type PartialMusicProduct =
  | Partial<Album>
  | Partial<CollectorEdition>
  | Partial<DigitalRelease>;
```

This stems from how `Omit` processes union types. Rather than iterating over each union member, it amalgamates them into a single structure it can understand.

The technical reason for this is that `Omit` and `Pick` are not distributive. This means that when you use them with a union type, they don't operate individually on each union member.

#### The `DistributiveOmit` and `DistributivePick` Types

In order to address this, we can create a `DistributiveOmit` type. It's defined similarly to Omit but operates individually on each union member. Note the inclusion of `PropertyKey` in the type definition to allow for any valid key type:

```typescript
type DistributiveOmit<T, K extends PropertyKey> = T extends any
  ? Omit<T, K>
  : never;
```

When we apply `DistributiveOmit` to our `MusicProduct` type, we get the anticipated result: a union of `Album`, `CollectorEdition`, and `DigitalRelease` with the `id` field omitted:

```typescript
type MusicProductWithoutId = DistributiveOmit<MusicProduct, "id">;

// Hovering over MusicProductWithoutId shows:
type MusicProductWithoutId =
  | Omit<Album, "id">
  | Omit<CollectorEdition, "id">
  | Omit<DigitalRelease, "id">;
```

Structurally, this is the same as:

```typescript
type MusicProductWithoutId =
  | {
      title: string;
      genre: string;
    }
  | {
      title: string;
      limitedEditionFeatures: string[];
    }
  | {
      title: string;
      digitalFormat: string;
    };
```

In situations where you need to use Omit with union types, using a distributive version will give you a much more predictable result.

For completeness, the `DistributivePick` type can be defined in a similar way:

```typescript
type DistributivePick<T, K extends PropertyKey> = T extends any
  ? Pick<T, K>
  : never;
```

### Exercises

#### Exercise 1: Expecting Certain Properties

In this exercise, we have a `fetchUser` function that uses `fetch` to access an endpoint named `APIUser` and it return a `Promise<User>`:

```ts twoslash
// @errors: 2344
import { Expect, Equal } from "@total-typescript/helpers";

// ---cut---
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const fetchUser = async (): Promise<User> => {
  const response = await fetch("/api/user");
  const user = await response.json();
  return user;
};

const example = async () => {
  const user = await fetchUser();

  type test = Expect<Equal<typeof user, { name: string; email: string }>>;
};
```

Since we're in an asynchronous function, we do want to use a `Promise`, but there's a problem with this `User` type.

In the `example` function that calls `fetchUser`, we're only expecting to receive the `name` and `email` fields. These fields are only part of what exists in the `User` interface.

Your task is to update the typing so that only the `name` and `email` fields are expected to be returned from `fetchUser`.

You can use the helper types we've looked at to accomplish this, but for extra practice try using just interfaces.

<Exercise title="Exercise 1: Expecting Certain Properties" filePath="/src/020-objects/089-pick-type-helper.problem.ts"></Exercise>

#### Exercise 2: Updating a Product

Here we have a function `updateProduct` that takes two arguments: an `id`, and a `productInfo` object derived from the `Product` type, excluding the `id` field.

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const updateProduct = (id: number, productInfo: Product) => {
  // Do something with the productInfo
};
```

The twist here is that during a product update, we might not want to modify all of its properties at the same time. Because of this, not all properties have to be passed into the function.

This means we have several different test scenarios. For example, update just the name, just the price, or just the description. Combinations like updating the name and the price or the name and the description are also tested.

```ts twoslash
// @errors: 2345
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const updateProduct = (id: number, productInfo: Product) => {
  // Do something with the productInfo
};

// ---cut---
updateProduct(1, {
  name: "Book",
});

updateProduct(1, {
  price: 12.99,
});
```

Your challenge is to modify the `productInfo` parameter to reflect these requirements. The `id` should remain absent from `productInfo`, but we also want all other properties in `productInfo` to be optional.

<Exercise title="Exercise 2: Updating a Product" filePath="/src/020-objects/091-omit-type-helper.problem.ts"></Exercise>

#### Solution 1: Expecting Certain Properties

There are quite a few ways to solve this problem. Here are a few examples:

##### Using Pick

Using the Pick utility type, we can create a new type that only includes the `name` and `email` properties from the `User` interface:

```typescript
type PickedUser = Pick<User, "name" | "email">;
```

Then the `fetchUser` function can be updated to return a `Promise` of `PickedUser`:

```typescript
const fetchUser = async (): Promise<PickedUser> => {
  ...
```

##### Using Omit

The Omit utility type can also be used to create a new type that excludes the `id` and `role` properties from the `User` interface:

```typescript
type OmittedUser = Omit<User, "id" | "role">;
```

Then the `fetchUser` function can be updated to return a `Promise` of `OmittedUser`:

```typescript
const fetchUser = async (): Promise<OmittedUser> => {
  ...
```

##### Extending an Interface

We could create an interface `NameAndEmail` that contains a `name` and `email` property, along with updating the `User` interface to remove those properties in favor of extending them:

```typescript
interface NameAndEmail {
  name: string;
  email: string;
}

interface User extends NameAndEmail {
  id: string;
  role: string;
}
```

Then the `fetchUser` function could return a `Promise` of `NameAndEmail`:

```typescript
const fetchUser = async (): Promise<NameAndEmail> => {
  // ...
};
```

`Omit` will mean that the object grows as the source object grows. `Pick` and `interface extends` will mean that the object will stay the same size. So depending on requirements, you can choose the best approach.

#### Solution 2: Updating a Product

Using a _combination_ of `Omit` and `Partial` will allow us to create a type that excludes the `id` field from `Product` and makes all other properties optional.

In this case, wrapping `Omit<Product, "id">` in `Partial` will remove the `id` while making all of the remaining properties optional:

```typescript
const updateProduct = (
  id: number,
  productInfo: Partial<Omit<Product, "id">>
) => {
  // Do something with the productInfo
};
```
