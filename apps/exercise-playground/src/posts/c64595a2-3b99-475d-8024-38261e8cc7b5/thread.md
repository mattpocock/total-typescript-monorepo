Generics are one of the 10 skills you need to become a TypeScript Wizard. (Grab that cheat sheet if you haven't already!)

And, I've said it before:

Generics are the most intimidating TypeScript feature...

Generics aren't something that "compiles down" to something that JavaScript does. They don’t exist at runtime. They're a tool for you to use in TypeScript — and TypeScript only.

JavaScript is about as loosely-typed as it gets. And if you’ve never worked in a language with strict types, you might get a bit freaked out by generics.

...but once you understand them, they're like magic.

You know that strong types protect you from bugs: by building a detailed understanding of how your app works before you ship it to users.

Every great power has a downside, though. The dynamic code you’re used to in JavaScript might lead you down a dark path. The more complex your runtime code, the more manual annotations you’ll need to provide to get it to work. Repetitive, dull boilerplate.

Unless... you master generics.

## Let's Build a Generic Function Step By Step

Let's look at a generic function I wrote just the other day. It's called `jsonParseFields`. I wanted it to:

- Receive an object
- Receive a set of keys that the object contained
- Call `JSON.parse` on each of those keys
- Return a new object containing all the original keys, with the parsed values

Here's what the function looks like in JavaScript:

```ts
// 1. Takes in obj and keys
export const jsonParseFields = (obj, keys) => {
  const objToReturn = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    // 2. If the key is in the keys set, parse the value
    // with JSON.parse
    if (keys.includes(key)) {
      objToReturn[key] = JSON.parse(value);
    } else {
      objToReturn[key] = value;
    }
  }

  // 3. Return the object
  return objToReturn;
};
```

And here's how you'd call it:

```ts
const obj = {
  name: "John",
  age: "30",
  address: '{"city": "New York", "state": "NY"}',
};

const objWithParsedAddress = jsonParseFields(obj, ["address"]);
```

How do you go about typing something like this?

## Track The Type Dependencies

Let's look back at the description of what we want our function to do. And specifically, let's write down any _type dependencies_ we can see.

A type dependency is a type that relies on the shape of another type.

The first one I can spot is fairly simple. The object we're _returning_ relies on the shape of the object we're _passing in_.

```txt
ObjectWePassIn => ObjectWeGetOut

{ a: string; b: string } => { a: string; b: string }
```

But it's not just that. The `ObjWeGetOut` also needs to know the keys that are being passed.

For each key in that array, we need to turn the corresponding value into a type of `unknown`. That's the safest type to use - we don't know what JSON.parse will return.

```txt
ObjectWePassIn, KeysToJsonParse => ObjectWeGetOut

{ a: string; b: string }, ["a"]
  =>
{ a: unknown; b: string }
```

And finally, I can spot one more! `KeysToJsonParse` can only contain keys that are present in `ObjectWePassIn`.

```txt
ObjectWePassIn => KeysToJsonParse

{ a: string; b: string } => constrained to ["a", "b"]

ObjectWePassIn, KeysToJsonParse => ObjectWeGetOut

{ a: string; b: string }, ["a"]
  =>
{ a: unknown; b: string }
```

That's all the type dependencies I can spot. What next?

## Declare The Inputs

We have two types that we need to know when the function's called: `ObjectWePassIn` and `KeysToJsonParse`. From those two types, we can derive the other type we need: `ObjectWeGetOut`.

That means our function needs two type parameters. We write them using angle brackets (`<` and `>`), and then use them before the function's parameters:

```ts
export const jsonParseFields = <ObjectWePassIn, KeysToJsonParse>(obj, keys) => {
  // ... implementation
};
```

We'll also annotate the runtime parameters with these types:

```ts
export const jsonParseFields = <ObjectWePassIn, KeysToJsonParse>(
  obj: ObjectWePassIn,
  keys: KeysToJsonParse
) => {
  // ... implementation
};
```

Let's figure out the dependency between our two input types, the one we described earlier:

```txt
ObjectWePassIn => KeysToJsonParse

{ a: string; b: string } => constrained to ["a", "b"]
```

We can write this as a generic constraint, using the `extends` keyword:

```ts
export const jsonParseFields = <
  ObjectWePassIn,
  KeysToJsonParse extends keyof ObjectWePassIn,
>(
  obj: ObjectWePassIn,
  keys: KeysToJsonParse[]
) => {
  // ... implementation
};
```

This now means we can't pass in any keys that aren't present in the object we're passing in. TypeScript will give us an error if we try:

```ts
export const jsonParseFields = <
  ObjectWePassIn,
  KeysToJsonParse extends keyof ObjectWePassIn,
>(
  obj: ObjectWePassIn,
  keys: KeysToJsonParse[]
) => {
  // ... implementation
};

// ---cut---
jsonParseFields({ a: "[]" }, ["a"]); // ✅
jsonParseFields({ a: "[]" }, ["a", "c"]); // ❌
```

## Declare The Output

Now, we need to figure out the output type. We know that it requires two things: the shape of the object we're passing in, and the keys we're parsing. We can write that as a generic type:

```ts
type ObjectWeGetOut<
  ObjectWePassIn,
  KeysToJsonParse extends keyof ObjectWePassIn,
> = // ...implementation
```

Notice how we're using the same parameters as the function, with the same constraints.

To actually implement the type, we're going to need some type transformation magic. Teaching it is a bit beyond the scope of this email, but it uses mapped types and conditional types. Here's the final implementation:

```ts
type ObjectWeGetOut<
  ObjectWePassIn,
  KeysToJsonParse extends keyof ObjectWePassIn,
> = {
  [Key in keyof ObjectWePassIn]: Key extends KeysToJsonParse
    ? unknown
    : ObjectWePassIn[Key];
};
```

Now, we can use this type in our function:

```ts
export const jsonParseFields = <
  ObjectWePassIn,
  KeysToJsonParse extends keyof ObjectWePassIn,
>(
  obj: ObjectWePassIn,
  keys: KeysToJsonParse[]
): ObjectWeGetOut<ObjectWePassIn, KeysToJsonParse> => {
  // ...implementation
};
```

And call it like this:

```ts twoslash
type ObjectWeGetOut<
  ObjectWePassIn,
  KeysToJsonParse extends keyof ObjectWePassIn,
> = Prettify<{
  [Key in keyof ObjectWePassIn]: Key extends KeysToJsonParse
    ? unknown
    : ObjectWePassIn[Key];
}>;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const jsonParseFields = <
  ObjectWePassIn extends object,
  KeysToJsonParse extends keyof ObjectWePassIn,
>(
  obj: ObjectWePassIn,
  keys: KeysToJsonParse[]
): ObjectWeGetOut<ObjectWePassIn, KeysToJsonParse> => {
  const objToReturn: any = {};

  for (const key of Object.keys(obj)) {
    const value = (obj as any)[key];
    if (keys.includes(key as any)) {
      objToReturn[key] = JSON.parse(value);
    } else {
      objToReturn[key] = value;
    }
  }

  return objToReturn;
};

// ---cut---
const result = jsonParseFields({ a: 123, b: "{}" }, ["b"]);
//    ^?
```

And that's it. We've successfully typed a generic function. I've left out a few details - but here's a [full playground](https://www.typescriptlang.org/play/?#code/PQKhCgAIUgJBTATvSBDZkAuALFBjbVAOwHN4BnSASQHIA3FAW1QBMUAzRAe0a10njMAlgBsAXFAjRIARgB0kAOqJUAB1XwWfFMnIBXEZiGksATw2ROPSAHkARgCt4eTIvgBxeJht7MkY5AACsiYRuymklhckMwA1ig4KFy+qr4xXBh28Ki+QuwGCgByXH5EzhTk6KYANJB2aURCePBykQAqiKaQyIxcdMYk2kEhYV2Y5ijEWuTwKNhcAO5DugZ+dOhCqHYi8JEExGSUWSKLrdCRAEwKAMJcROSYKsaato7OrvCBqOTkVERRdUm-y4bxctXI0RwqD8C3wxEiqm+lCEfkw0XsThccnipkolXY8BEpgUHS6PT6A38mFqU0gMxQC0ImEiSG4iEgXDweD0iHIZykMAAzAoAIIsNhadaIITJSjEUw0OVELQ0b5oIgKgGJfyMVQ7RjwIiYaEyoj8yBtCYAZTw0tUfiElGQqBERLqrDQfjwdweiD0LkpIMxmEoLFMRFQjCaLqJ1UiEMgsMgZReaMgehmkFVGpo-n+UplGbpqhKlDTcRQKMgiJ+5tovHYz0TKOwfEdkAAtHmYmTsiIdXrBIbjUY7tRIIQGOnGszpJgKCHIN6GNKTNq-UahAbAZOZeyuOwhvkiAG7qLlYC8DkZpFYfQEhMtOuvDz8y69ElD9rj6eiLVEpm8qKnsxA0H4OyoLEHJpLSLDRPKkAsJGqBkPywDgOA4wWBi7xuJ43i+AAPFArzBm4Xw-H8caQJAADS8C4m0XAAFIQkQXy8ig8AAB7zsqlA4gepG4Z8SJUeAAB8kAALyQKAsjQMAwxeKMhEAN4kQA2vRXQBIJh44S45FiUQAC6Yh0QxAi8YaLCUDp5BMaxdwcTeNE0QA-NOsREIsRAkTRFmGR8FG-EQ2kMaZADc4AAL4STFmETMpoR5KYhFtFJskaTR2ndvpFrmRa2nRXFkAAGSQGpsWJTxJaIF6Pp+A4bGufAABiQiEnZMmQMRNHBcZlH-DxfE9UG7xyTAFyKdRlmMSxrXoJmo22QJDFCYNonDXGEkABQkUGQWgiFJlzTi5AWQ5TlLZxmmmXGACUx1kR4Xg+JghFbaFVHzY5i0uct8BZVJOVLk1HKOExABKL6IEQFkIdlNVTZAgqKRhNHsBkkB7d69x+DiHIGSd2IMeQe1Bo9j1VQF4ME5A6wiB+vWU44aBKqYj2aTi0Wo+jIDoe5-iHntF1yMYeDM2wFNE2q8o0-JAvADTYPC0GMNw+FvO9cxVo2IUciIpxe1Mx+j0xcLsUCCImZq+5GtcLDmCvjzkW9Wb8CW+5sUkb7JEhK+kMOJrLvwzFNUYfjDzdBQqy9S1gOcZ13UU2paAWTIFyCrUdgWTQ6cAESoIXFnF3YeCF7FuaxbUmmF3YhemRb4DAEp7kAHoeeAQA) where you can mess about with the implementation to your heart's content.

There you have it: a complex generic function, typed to perfection.

You've made your code clean, readable, error-free and DRY

But Wizards can do much, much more with generics.

And if you struggled to follow along, I've got good news for you. The best way to learn is by doing.

That's why I'm making my Generics workshop free for a limited time.

Enroll in this special freebie by 2024-12-19 and you'll get instant access to the workshop where you'll learn...

- How to use generic types, functions and classes
- How to pass and infer generic types
- All the hidden tricks library authors use to create amazing generic inference

...taught the Total TypeScript way.

This is just a taste of what it's like to have a comprehensive TypeScript compendium at your fingertips, with lessons and bite-sized exercises for every TypeScript feature and dilemma, from mastering the very basics to making the most advanced features totally yours.

When you enroll in Total TypeScript Pro Complete today for $500, you'll save $295 and get access to 400+ exercises across 5 workshops. You'll get lifetime access to everything TypeScript that you need & want to learn, wherever, and whenever, you want to learn it.

This deal ends Dec 19, though, so don't wait too long!
