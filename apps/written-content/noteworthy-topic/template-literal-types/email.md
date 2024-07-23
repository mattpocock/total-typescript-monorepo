Similar to how template literals in JavaScript allow you to interpolate values into strings, template literal types in TypeScript can be used to interpolate other types into string types.

For example, let's create a `PngFile` type that represents a string that ends with ".png":

```tsx
type PngFile = `${string}.png`;
```

Now when we type a new variable as `PngFile`, it must end with ".png":

```tsx
let myImage: PngFile = "my-image.png";
```

When a string does not match the pattern defined in the `PngFile` type, TypeScript will show an error:

```ts twoslash
// @errors: 2322
type PngFile = `${string}.png`;

// ---cut---
let myImage: PngFile = "my-image.jpg";
```

This technique has various applications. You can ensure that a string starts with a certain prefix, such as requiring a route to start with `/`:

```ts twoslash
// @errors: 2322
type Route = `/${string}`;

const myRoute: Route = "/home";
const badRoute: Route = "home";
```

You can ensure that a string must contain a certain substring, such as requiring a string to contain `?` to be considered a query string:

```ts twoslash
// @errors: 2322

type QueryString = `${string}?${string}`;

const myQueryString: QueryString = "search?query=hello";
const badQueryString: QueryString = "search";
```

Template literals are so powerful that they've been used to create entire parsers in the type-level in TypeScript. [gql.tada](https://gql-tada.0no.co/) creates type-safe GraphQL queries from strings, and [ArkType](https://arktype.io/) does a similar process for validation schemas.

### Combining Template Literal Types with Union Types

A common pattern with template literal strings is to use them with union types. By passing a union to a template literal type, you can generate a type that represents all possible combinations of the union.

For example, let's imagine we have a set of colors each with possible shades from `100` to `900`:

```tsx
type ColorShade =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;
type Color = "red" | "blue" | "green";
```

If we want a combination of all possible colors and shades, we can use a template literal type to generate a new type:

```tsx
type ColorPalette = `${Color}-${ColorShade}`;
```

Now, `ColorPalette` will represent all possible combinations of colors and shades:

```ts twoslash
type ColorShade =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;
type Color = "red" | "blue" | "green";

type ColorPalette = `${Color}-${ColorShade}`;

// ---cut---
let color: ColorPalette = "red-500";

// @errors: 2322
let badColor: ColorPalette = "red";
```

That's 27 possible combinations - three colors times nine shades.

If you have any kind of string pattern you want to enforce in your application, from routes to URI's to hex codes, template literal types can help.

### Transforming String Types

TypeScript even has several built-in utility types for transforming string types. For example, `Uppercase` and `Lowercase` can be used to convert a string to uppercase or lowercase:

```ts twoslash
type UppercaseHello = Uppercase<"hello">;
//   ^?
type LowercaseHELLO = Lowercase<"HELLO">;
//   ^?
```

The `Capitalize` type can be used to capitalize the first letter of a string:

```ts twoslash
type CapitalizeMatt = Capitalize<"matt">;
//   ^?
```

The `Uncapitalize` type can be used to lowercase the first letter of a string:

```ts twoslash
type UncapitalizePHD = Uncapitalize<"PHD">;
//   ^?
```

These utility types are occasionally useful for transforming string types in your applications, and show how flexible TypeScript's type system can be.
