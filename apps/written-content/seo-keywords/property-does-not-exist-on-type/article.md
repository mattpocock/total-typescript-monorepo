# Property Does Not Exist on Type

> Property 'x' does not exist on type 'y'.

This is an extremely common error in TypeScript, so it's important that you understand what it means.

## Quick Explanation

This error is probably occurring because you're trying to access, modify, or delete a property that TypeScript doesn't think is on the object.

```ts twoslash
// @errors: 2339
const example = {};

// Can't access it
example.doesntExist;

// Can't modify it
example.doesntExist = 1;

// Can't delete it
delete example.doesntExist;
```

The reason this happens is that TypeScript thinks your object has a certain shape. If you try to access a property on it that doesn't exist, TypeScript is pretty sure that you've made an error.

It might strike you as odd. The following code won't throw an error at runtime, but TypeScript will give you a big red line:

```ts twoslash
// @errors: 2339
const example = {};

const result = example.doesntExist;
```

This falls into the category of "TypeScript being helpful". TypeScript is pretty sure you've made a mistake, so it's trying to help you out.

So, onto the solutions.

## Solution 1: Is it a typo?

You might have accidentally made a typo in the property name. These can be extremely subtle:

```ts twoslash
// @errors: 2551
type MyUser = {
  fullName: string;
};

const getUserName = (user: MyUser) => {
  return user.fullname;
};
```

If so, use autocomplete on the object you're trying to access to see what properties are available. That's a surefire way to avoid these kinds of issues in the future.

## Solution 2: Widen the type

You might be more sure than TypeScript that the property exists. In that case, you can add it as an optional property to the object you're manipulating:

```ts twoslash
const example: {
  doesntExist?: number;
} = {};

example.doesntExist = 1;

example.doesntExist;
```

TypeScript can't figure out from you assigning `doesntExist` to `1` that it should be a number, so it's important that you tell it via a type annotation.

## Solution 3: Use a Record type

If you're trying to create an object with a dynamic key, you can use a `Record` type to tell TypeScript that the object has a dynamic key:

```ts twoslash
const example: Record<string, number> = {};

example.doesntExist = 1;

example.doesntExist;
```

This is a great way to avoid this error and is great for creating object maps and dictionaries.
