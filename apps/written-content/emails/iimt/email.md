# The IIMT

Since I first got into advanced TypeScript, I've been in love with a particular pattern. It formed the basis for one of my first-ever TypeScript tips, and it's been extraordinarily useful to me ever since.

I call it the **IIMT** (rhymes with 'limped'): the **Immediately Indexed Mapped Type**.

## What is an IIMT?

Here's what it looks like:

```ts twoslash
type SomeObject = {
  a: string;
  b: number;
};

type Example = {
  [K in keyof SomeObject]: {
    key: K;
  };
}[keyof SomeObject];

type Result = Example;
//   ^?
```

This can look really confusing at first glance - but it's really just a two-step process.

### Step 1: Create a mapped type

We first create a mapped type:

```ts twoslash
type SomeObject = {
  a: string;
  b: number;
};

// ---cut---
type Example = {
  [K in keyof SomeObject]: {
    key: K;
  };
};

type Result = Example;
//   ^?
```

This mapped type iterates over the keys of `SomeObject` and creates a new object type for each key. So, we end up with `Example` being an object with two properties: `a` and `b`, each with a `key` property.

Inside `{ key: K }`, we could do anything we want:

```ts twoslash
type SomeObject = {
  a: string;
  b: number;
};

// ---cut---
type Example = {
  [K in keyof SomeObject]: {
    index: number;
    key: K;
    value: SomeObject[K];
  };
};

type Result = Example;
//   ^?
```

Here, we're adding an `index` property, the `key` property, and the `value` property. The `value` property is the type of the value at the key `K` in `SomeObject`.

Whatever we put after `[K in keyof SomeObject]:`, we'll be turning into a union in a second - so this is the place to add any properties you want to the resulting type.

### Step 2: Index into the mapped type

Once we've created this temporary object, we immediately index into it using `[keyof SomeObject]`:

```ts twoslash
type SomeObject = {
  a: string;
  b: number;
};

// ---cut---
export type Example = {
  [K in keyof SomeObject]: {
    index: number;
    key: K;
    value: SomeObject[K];
  };
}[keyof SomeObject]; // Immediate index!

type Result = Example;
//   ^?
```

This is where the magic happens. By indexing into our object with a _union_ type (in this case `a` | `b`), we're creating a new union from it. It's as if we did this:

```ts twoslash
type SomeObject = {
  a: string;
  b: number;
};

// ---cut---
export type Example = {
  [K in keyof SomeObject]: {
    index: number;
    key: K;
    value: SomeObject[K];
  };
};

type Result = Example["a"] | Example["b"];
//   ^?
```

But by immediately indexing into the mapped type, we can avoid having to write out the union type manually.

So, that's the pattern. Create a mapped type, then immediately index into it with a union type. An IIMT.

But why is this useful?

## Iterating over unions

IIMTs give us a really clear model for iterating over members of a union. Let's say we want to create a discriminated union based on a union of strings:

```ts twoslash
type Fruit = "apple" | "banana" | "orange";

export type FruitInfo = {
  [F in Fruit]: {
    thisFruit: F;
    allFruit: Fruit;
  };
}[Fruit];

type Result = FruitInfo;
//   ^?
```

We can see that the resulting type is a union of three objects, each with a `thisFruit` property and an `allFruit` property. The `thisFruit` property is the _specific_ member of the union, and the `allFruit` property is the _entire_ union.

This lets us do really smart things within the scope where `F` is defined. What if we wanted to capture the _other_ fruit?

```ts twoslash
type Fruit = "apple" | "banana" | "orange";

// ---cut---
export type FruitInfo = {
  [F in Fruit]: {
    thisFruit: F;
    otherFruit: Exclude<Fruit, F>;
  };
}[Fruit];
```

Because `F` and `Fruit` are available in the same closure, we can use `Exclude` to remove the current fruit from the union in `otherFruit`. Very nice - and once you're used to the IIMT structure, pretty clear to read.

## Examples

Let's tie this off by looking at a couple of examples:

### Object of CSS Units

```ts twoslash
type CSSUnits = "px" | "em" | "rem" | "vw" | "vh";

export type CSSLength = {
  [U in CSSUnits]: {
    length: number;
    unit: U;
  };
}[CSSUnits];

type Result = CSSLength;
//   ^?
```

### HTTP Response Codes

```ts twoslash
type SuccessResponseCode = 200;

type ErrorResponseCode = 400 | 500;

type ResponseCode = SuccessResponseCode | ErrorResponseCode;

type ResponseShape = {
  [C in ResponseCode]: {
    code: C;
    body: C extends SuccessResponseCode
      ? { success: true }
      : { success: false; error: string };
  };
}[ResponseCode];

type Result = ResponseShape;
//   ^?
```

## Summary

- The IIMT is a pattern where you create a mapped type and immediately index into it with a union type. `{ [K in keyof T]: ... }[keyof T]`.
- This works because indexing into an object with a union type creates a new union of the object's values.
- This pattern is useful for iterating over members of a union and creating discriminated unions.
