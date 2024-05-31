# What on earth is 'string & {}'?

## The Problem

Imagine you're building an `Icon` component. As part of the component's API, you want users to be able to specify the color of the icon.

Your brand has some known colors, like `primary` and `secondary`. But you also want to make sure that users can specify any color they want.

You might start by defining a `Color` type:

```tsx twoslash
type Color = "primary" | "secondary" | string;
```

Then, using that type in your `Icon` component:

```tsx twoslash
type Color = "primary" | "secondary" | string;

// ---cut---
type IconProps = {
  color: Color;
};

const Icon = ({ color }: IconProps) => {
  // ...
};
```

Then, you might use the `Icon` component like this:

```tsx twoslash
import React, { FC } from "react";

type Color = "primary" | "secondary" | string;

type IconProps = {
  color: Color;
};

declare const Icon: FC<IconProps>;

// ---cut---
<Icon color="primary" />;
```

But there's an issue. We aren't getting `color` suggestions when we use the `Icon` component. If we try to autocomplete the `color` prop, we get no suggestions.

Ideally, we want `primary` and `secondary` to be part of that list. How do we manage that?

## The Solution

The solution is very odd-looking. We can intersect the `string` type in `Color` with an empty object:

```tsx twoslash
type Color = "primary" | "secondary" | (string & {});
```

Now, we'll get suggestions for `primary` and `secondary` when we use the `Icon` component.

What on earth?

## Why It Works

This works because of a quirk of the TypeScript compiler.

When you create a union between a string literal type and `string`, TypeScript will eagerly widen the type to `string`. We can see this by hovering over `Color` without the intersection:

```tsx twoslash
type Color = "primary" | "secondary" | string;
//   ^?
```

So, before it's ever used, TypeScript has already forgotten that `"primary"` and `"secondary"` were ever part of the type.

But by intersecting `string` with an empty object, we trick TypeScript into retaining the string literal types for a bit longer.

```tsx twoslash
type Color = "primary" | "secondary" | (string & {});
//   ^?
```

Now, when we use `Color`, TypeScript will remember that `"primary"` and `"secondary"` are part of the type - and it'll give us suggestions accordingly.

`string & {}` is actually exactly the same type as `string` - so there's no difference in what types can be passed to our `Icon` component:

```tsx twoslash
import React, { FC } from "react";

type Color = "primary" | "secondary" | (string & {});

type IconProps = {
  color: Color;
};

declare const Icon: FC<IconProps>;

// ---cut---
<Icon color="primary" />;
<Icon color="secondary" />;
<Icon color="#fff" />;
```

## This Looks Pretty Fragile...

You might think that this is a pretty fragile solution. This doesn't seem like intended behavior from TypeScript. Surely, at some point, this will break?

Well, the TypeScript team actually know about this trick. They test against it.

Someday, they may make it so that a plain `string` type will remember string literal types. But until then, this is a neat trick to remember.

## Summary

- When you want to allow any string, but still give suggestions for known string literals, you can use `string & {}`.
- This works because it prevents TypeScript from eagerly collapsing `string | "literal"` into just `string`.
- It behaves exactly the same way as `string`, but with autocomplete added.
- Someday, `string | "literal"` will just work.
