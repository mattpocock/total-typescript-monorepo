# The Fastest Way To Tank Your React App's TS Performance

A couple of years ago, Sentry were having big problems with their React app. They'd pretty recently [migrated it to TypeScript](https://blog.sentry.io/slow-and-steady-converting-sentrys-entire-frontend-to-typescript) from JavaScript. And the app was part of a large monorepo.

But the [IDE performance](https://www.totaltypescript.com/typescript-performance) was slow. You'd often need to wait a couple of seconds after making a change for the TypeScript language server to update. And running `tsc` would take a long time.

Now, this isn't unusual for a large TypeScript codebase. But the Sentry team had a hunch that something was wrong. The problem felt out of proportion to the size of the codebase.

It turned out that the issue, outlined by [Jonas](https://twitter.com/JonasBadalic/status/1765006152150974919), was down to a single pattern.

## How To Tank Your React App's TS Performance

In tons of places in Sentry's codebase, they were extending HTML types in React. For instance, defining `ButtonProps` would look like this:

```tsx twoslash
import React from "react";

type ButtonProps =
  React.HTMLAttributes<HTMLButtonElement> & {
    extraProp: string;
  };

const Button = ({ extraProp, ...props }: ButtonProps) => {
  console.log(extraProp);
  return <button {...props} />;
};
```

This means that you could pass in all the props that a `<button>` element could take, plus an `extraProp`:

```tsx twoslash
import React from "react";

type ButtonProps =
  React.HTMLAttributes<HTMLButtonElement> & {
    extraProp: string;
  };

const Button = ({ extraProp, ...props }: ButtonProps) => {
  console.log(extraProp);
  return <button {...props} />;
};

// ---cut---

<Button
  extraProp="whatever"
  onClick={(e) => {
    //      ^?
  }}
/>;
```

But it turns out that this pattern is devilishly slow. So Jonas, following the advice of the [TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance), changed each of these to use an `interface` instead:

```tsx twoslash
import React from "react";

interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  extraProp: string;
}
```

Suddenly, things got a lot snappier. The TypeScript language server was faster, and `tsc` ran quicker. Just from a little syntax change. Why?

## Why Did This Happen?

You may have heard that `interface` is slightly faster than `type`. This is not quite true. In fact, `interface extends` is slightly faster than `&`.

The reason for this is that when an interface which extends another interface is created, TypeScript checks the relationship between each member then and there.

You'd get an error if you tried to incorrectly extend an interface:

```tsx twoslash
// @errors: 2430
import React from "react";

interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  onChange: string;
}
```

This means that when you create an interface, TypeScript can cache the relationship between the two interfaces, and it never needs to check it again.

But with `type`, TypeScript doesn't check the relationship until you use the type.

And in this case, this is a problem. `React.HTMLAttributes<HTMLButtonElement>` is a huge type. It's got a lot of properties. And every time, it needs to check if `extraProp` is being overridden.

This means that the slowdown is a MULTIPLE of two things:

1. The number of properties in `React.HTMLAttributes<HTMLButtonElement>`
2. The number of times you use `Button`

So, it gets bad quickly.

With an interface, it only needs to check the properties once, so it's just once per number of times you use `Button`.

So, if you see this code in your codebase, change it to use `interface extends` instead of `&`. It's a small change that can make a big, big difference.
