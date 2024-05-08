Just like my previous article on [Exclude](https://www.totaltypescript.com/uses-for-exclude-type-helper), I’ve put together a bunch of different use cases for one of TypeScript's most useful helpers - `Extract`.

## Extract a member of a discriminated union by discriminator

Given a discriminated union, like `Event` below, you often need to be able to access a single member of the union.

This can feel like an obscure problem, until you realize that `Extract` is the perfect tool for the job.

Here, we're extracting the `ClickEvent` type from the `Event`:

```ts twoslash
// @moduleDetection: force
type Event =
  | {
      type: "click";
      x: number;
      y: number;
    }
  | {
      type: "focus";
    }
  | {
      type: "blur";
    };

type ClickEvent = Extract<Event, { type: "click" }>;
//   ^?
```

We pass `Event` as the first argument to `Extract`, and then we pass the shape of the member we want to extract as the second argument.

Crucially, we don't need to pass the entire member to `Extract`, just the shape we want to match. Beautiful.

## Extract a member of a discriminated union by shape

Sometimes, we want to extract a specific member of a discriminated union based on its shape, rather than its discriminator.

Let's go back to our `Event` type we declared earlier:

```ts twoslash
// @moduleDetection: force
type Event =
  | {
      type: "mousedown";
      x: number;
      y: number;
    }
  | {
      type: "mouseup";
      x: number;
      y: number;
    }
  | {
      type: "blur";
    };
```

Instead of extracting a member based on its discriminator, let's say we want to extract a member that has an `x` property of type `number`.

We can provide `{ x: number }` as the shape to match:

```ts twoslash
// @moduleDetection: force
type Event =
  | {
      type: "mousedown";
      x: number;
      y: number;
    }
  | {
      type: "mouseup";
      x: number;
      y: number;
    }
  | {
      type: "blur";
    };

// ---cut---
type ClickEvent = Extract<Event, { x: number }>;
//   ^?
```

The result is the `ClickEvent` type, which is the member of the `Event` union that has an `x` property of type `number`. In this case, since both the `mousedown` and `mouseup` members have an `x` property, the `ClickEvent` type will be a union of these two members.

## Extract all strings/booleans/numbers from a union

Let's consider a union type that includes a mix of strings, booleans, and numbers:

```ts twoslash
// @moduleDetection: force
type PossibleValues =
  | "admin"
  | "user"
  | "guest"
  | true
  | false
  | 1
  | 2
  | 3;
```

To extract all the string members from this union, we can use `Extract<PossibleValues, string>`:

```ts twoslash
// @moduleDetection: force
type PossibleValues =
  | "admin"
  | "user"
  | "guest"
  | true
  | false
  | 1
  | 2
  | 3;

// ---cut---
type Strings = Extract<PossibleValues, string>;
//   ^?
```

The result will be the `Strings` type, which is a union of all the string members ("admin", "user", and "guest") in the `PossibleValues` union.

## Extract all functions from a union

Let's say we have a union type that includes a mix of strings, numbers, booleans, and functions:

```ts twoslash
// @moduleDetection: force
type PossibleValues =
  | string
  | number
  | boolean
  | (() => void);
```

To extract all the function members from this union, we can use `Extract<PossibleValues, (...args: any[]) => any>`:

```ts twoslash
// @moduleDetection: force
type PossibleValues =
  | string
  | number
  | boolean
  | (() => void);

// ---cut---
type Functions = Extract<
  //   ^?
  PossibleValues,
  (...args: any[]) => any
>;
```

`(...args: any[]) => any` effectively matches any function type - so we can use it to extract all the function members from the union.

In this case, the `Functions` type will only contain the `() => void` function type.

## Exclude null and undefined from a union

There are times when we want to exclude certain types from a union. We may have a union type that includes `null` and `undefined`, but we want to create a new type that excludes those values.

```ts twoslash
// @moduleDetection: force
type PossibleValues =
  | string
  | number
  | boolean
  | null
  | undefined;
```

To exclude `null` and `undefined` from `PossibleValues`, we can use `Extract<PossibleValues, {}>`.

```ts twoslash
// @moduleDetection: force
type PossibleValues =
  | string
  | number
  | boolean
  | null
  | undefined;

// ---cut---
type NotNull = Extract<PossibleValues, {}>;
//   ^?
```

We can use `{}` as the second argument to `Extract` to match all types EXCEPT for `null` and `undefined`. You can learn more in [this article](https://www.totaltypescript.com/the-empty-object-type-in-typescript) on the empty object type.

## Find common members between two unions

In the following example, we have two union types: `EnglishSpeakingCountries` and `CountriesInWesternHemisphere`:

```ts twoslash
type EnglishSpeakingCountries = "UK" | "USA" | "Canada";
type CountriesInWesternHemisphere =
  | "USA"
  | "Canada"
  | "Mexico";
```

To find the common countries between these two unions, we can use the `Extract` utility type like this:

```ts twoslash
type EnglishSpeakingCountries = "UK" | "USA" | "Canada";
type CountriesInWesternHemisphere =
  | "USA"
  | "Canada"
  | "Mexico";

// ---cut---

type CommonCountries = Extract<
  //   ^?
  EnglishSpeakingCountries,
  CountriesInWesternHemisphere
>;
```

The resulting `CommonCountries` type will contain only the members that are present in both unions. In this case, the common country is "USA" as it exists in both unions.
