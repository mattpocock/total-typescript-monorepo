Did you know that types and interfaces handle hovers differently?

```ts twoslash
// YUCK. How do we improve this hover?
type ReadonlyDate = Omit<Date, `set${string}`>;
//   ^?
```

We're doing something kind of clever here. We're creating a new version of `Date` that can't be mutated.

```ts twoslash
// @errors: 2551
type ReadonlyDate = Omit<Date, `set${string}`>;

const myFunc = (date: ReadonlyDate) => {
  date.setDate(1);
};
```

But the readout of the type is really grim.

It displays the entire computed output of our `Omit`, which is dozens of properties.

```ts twoslash
type ReadonlyDate = Omit<Date, `set${string}`>;
//   ^?
```

We can improve this by using an interface instead.

We can create an empty interface that inherits from our fancy `Omit` shenanigans:

```ts twoslash
interface ReadonlyDate extends Omit<Date, `set${string}`> {}
```

Now, the hover is just the _name_ of the interface:

```ts twoslash
interface ReadonlyDate extends Omit<Date, `set${string}`> {}
// ---cut---
// Just the name of the interface! Much better.
const myFunc = (date: ReadonlyDate) => {
  //                  ^?
};
```

Of course, this is not always what you want - sometimes seeing the computed properties themselves is really useful.

The Prettify type helper can compute the properties of a named interface.

You can learn more from [this article](https://www.totaltypescript.com/concepts/the-prettify-helper).

```ts twoslash
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// ---cut---
interface NamedInterface {
  a: string;
  b: number;
}

type WithoutPrettify = NamedInterface;
//   ^?

type WithPrettify = Prettify<NamedInterface>;
//   ^?
```

But this is worth bearing in mind if you want to control the way your types display when they hover.

Types are more likely to display computed readouts (though, not always).

Interfaces will pretty much always display the name of the interface.

```ts twoslash
type ReadonlyDateAsType = Omit<Date, `set${string}`>;

interface ReadonlyDateAsInterface
  extends Omit<Date, `set${string}`> {}

type Show1 = ReadonlyDateAsType;
//   ^?

type Show2 = ReadonlyDateAsInterface;
//   ^?
```
