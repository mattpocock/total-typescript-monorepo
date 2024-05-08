## The History of Enums

When TypeScript first emerged in 2012, it brought several features into JavaScript which didn't, at the time, exist. The main feature was classes. These were so popular that they were added to JavaScript in 2015.

But another feature was added by TypeScript that, as of yet, hasn't made its way into JavaScript itself: enums.

In TypeScript, enums work in a similar way to how other languages implement them. They are a way to define a set of values which, when used, MUST refer to the original object.

```ts twoslash
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

const move = (direction: Direction) => {};

move(Direction.Up);
move(Direction.Down);
```

Let's learn about how they work - and perhaps why they haven't yet been added to JavaScript in the way classes were.

## How Do TypeScript Enums Work?

TypeScript enums give you a way to define a set of named constants which, when used, MUST reference the original enum.

There are two types of enums: numeric and string.

### Numeric Enums

Numeric enums are assigned a number value, starting at 0, and incrementing by 1 for each subsequent value.

```ts twoslash
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

console.log(Direction.Up);
//                    ^?
console.log(Direction.Down);
//                    ^?
console.log(Direction.Left);
//                    ^?
console.log(Direction.Right);
//                    ^?
```

#### Changing the Starting Value

You can change this by assigning a value to the first enum value. The rest will then be incremented from there.

```ts twoslash
enum Direction {
  Up = 10,
  Down,
  Left,
  Right,
}

console.log(Direction.Up);
//                    ^?
console.log(Direction.Down);
//                    ^?
console.log(Direction.Left);
//                    ^?
console.log(Direction.Right);
//                    ^?
```

#### Assigning Every Value

You can give _every_ member a different value if you want:

```ts twoslash
enum Direction {
  Up = 10,
  Down = 20,
  Left = 30,
  Right = 40,
}

console.log(Direction.Up);
//                    ^?
console.log(Direction.Down);
//                    ^?
console.log(Direction.Left);
//                    ^?
console.log(Direction.Right);
//                    ^?
```

#### Assigning Duplicate Values

You can also assign values which are the same:

```ts twoslash
enum Direction {
  Up = 0,
  Down = 0,
  Left = 0,
  Right = 0,
}

console.log(Direction.Up);
//                    ^?
console.log(Direction.Down);
//                    ^?
console.log(Direction.Left);
//                    ^?
console.log(Direction.Right);
//                    ^?
```

Although this looks odd, it makes sense for when you need to alias different members to the same value.

### String Enums

This page is under construction. We'll be adding more here soon.

### Mixed Enums

This page is under construction. We'll be adding more here soon.

## Are Enums Type Safe?

This page is under construction. We'll be adding more here soon.

## What Do Enums Compile To?

This page is under construction. We'll be adding more here soon.

## Will Enums Be Added To JavaScript?

This page is under construction. We'll be adding more here soon.

## Would Enums Be Added To TypeScript Today?

This page is under construction. We'll be adding more here soon.
