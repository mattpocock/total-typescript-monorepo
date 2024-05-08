# Mapped Types

Mapped types are a feature in TypeScript which allow you to map over a union of types to create a new type.

The syntax looks like this:

```typescript
type Fruit = "apple" | "banana" | "orange";

type NewType = {
  [F in Fruit]: {
    name: F;
  };
};
/**
 * {
 *   apple: { name: "apple" };
 *   banana: { name: "banana" };
 *   orange: { name: "orange" };
 * }
 */
```

Let's break down each piece of syntax we're seeing here. The `F in Fruit` acts as a kind of index signature, which allows us to loop over each member of the `Fruit` union. You can think of this as being similar to a JavaScript `for...of` loop:

```typescript
const fruit = ["apple", "banana", "orange"];

for (const f of fruit) {
  console.log(f);
}
```

In both cases, we get a very important thing: a closure over the current thing we're iterating over. In the JavaScript example, we get the current item. In the TypeScript example, we get the current member of the union.

This ability to cleanly map over each member of a union in a simple `for...of` model is what makes mapped types so powerful.

## With `keyof`

Using the `keyof` operator with mapped types gives you a smooth API to create object types _from_ other object types.

```typescript
interface Person {
  name: string;
  age: number;
}

type NullablePerson = {
  [P in keyof Person]: Person[P] | null;
};

/**
 * {
 *   name: string | null;
 *   age: number | null;
 * }
 */
```

Here, we gain access to `P`, which represents either `name` the first time this is iterated over, then `age` the second time. This means we can gain access to the type of each property's value in `Person` by using `Person[P]`.

We can then use this to create a new type that has the same keys and values as `Person` but with each property being nullable.

## Mapping non-string unions with `as`

Sometimes, you'll have a union of things which can't be assigned to the key of an object. For instance, a union of objects:

```typescript
type Event =
  | {
      type: "click";
      x: number;
      y: number;
    }
  | {
      type: "hover";
      element: HTMLElement;
    };
```

Here, you can see that `Event` is a union of two objects. If we tried to do `[E in Event]`, we'd get an error:

```typescript
type EventMap = {
  // Type 'Event' is not assignable to type 'string | number | symbol'.
  [E in Event]: (event: E) => void;
};
```

To get around this, we can use the `as` keyword to tell TypeScript that we want to use the `type` property of each `E` as we iterate over it:

```typescript
type EventMap = {
  [E in Event as E["type"]]: (event: E) => void;
};

/**
 * {
 *   click: (event: { type: "click"; x: number; y: number; }) => void;
 *   hover: (event: { type: "hover"; element: HTMLElement; }) => void;
 * }
 */
```
