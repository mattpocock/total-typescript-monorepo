```ts !!
// Imagine we have a color theme in our app
// with primary, secondary and tertiary colours.
```

```ts !!
// Lots of our 'color' props are going to
// look like this:
type Props = {
  color: "primary" | "secondary" | "tertiary";
};
```

```ts !!
// So we should probably extract this into its own
// type and reuse it various places.
type Color = "primary" | "secondary" | "tertiary";
```

```ts !!
type Color = "primary" | "secondary" | "tertiary";

// But what if we want the user to be able to pass
// either the brand colors, OR any other color?
```

```ts !!
type Color = "primary" | "secondary" | "tertiary";

// This should be allowed...
const example: Color = "primary";
```

```ts !!
// @errors: 2322
type Color = "primary" | "secondary" | "tertiary";

const example: Color = "primary";

// This should also be allowed, but it's failing!
const shouldAlsoBeFine: Color = "#fff";
```

```ts !!
// @errors: 2322
// We can add '| string' here to make it work...
type Color = "primary" | "secondary" | "tertiary" | string;

const example: Color = "primary";

const shouldAlsoBeFine: Color = "#fff";
```

```ts !!
// @errors: 2322
// But this means our Color type has been reduced to
// just string. We've lost 'primary', 'secondary' etc.
type Color = "primary" | "secondary" | "tertiary" | string;
//   ^?

const example: Color = "primary";

const shouldAlsoBeFine: Color = "#fff";
```

```ts !!
// @errors: 2322
type Color = "primary" | "secondary" | "tertiary" | string;

// This also means that when we try to autocomplete
// here, we won't see 'primary' or 'secondary'.
const example: Color = "primary";

const shouldAlsoBeFine: Color = "#fff";
```

```ts !!
// @errors: 2322
// The way to fix this is bizarre. We intersect string
// with '{}'.
type Color =
  | "primary"
  | "secondary"
  | "tertiary"
  | (string & {});

const example: Color = "primary";

const shouldAlsoBeFine: Color = "#fff";
```

```ts !!
// @errors: 2322
type Color =
  | "primary"
  | "secondary"
  | "tertiary"
  | (string & {});

// That intersection delays the merging of the union,
// meaning that Color still retains 'primary', 'secondary'
// and 'tertiary':
const example: Color = "primary";
//             ^?

const shouldAlsoBeFine: Color = "#fff";
```

```ts !!
// @errors: 2322
type Color =
  | "primary"
  | "secondary"
  | "tertiary"
  | (string & {});

// This means we get the best of both worlds: autocomplete,
// with the correct widening of the type.
const example: Color = "primary";

const shouldAlsoBeFine: Color = "#fff";
```
