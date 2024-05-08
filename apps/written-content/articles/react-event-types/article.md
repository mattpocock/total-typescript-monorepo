# Working With Events in React and TypeScript

## The Problem

When you're working with React and TypeScript, you'll often encounter this kind of error:

```tsx twoslash
// @errors: 7006
const onChange = (e) => {};

<input onChange={onChange} />;
```

It's not always clear what type you should give to the `e` inside your `onChange` function.

This can happen with `onClick`, `onSubmit`, or any of the other event handlers that DOM elements receive.

Luckily, there are several solutions:

## Solution 1: Hover, Then Type The Handler

The first solution is to hover over the type of the thing you're trying to pass in:

```tsx twoslash
const onChange = () => {};
// ---cut---

<input onChange={onChange} />;
//     ^?
```

As you can see, this outputs an astonishingly long type:

```txt
React.InputHTMLAttributes<HTMLInputElement>.onChange?:
  React.ChangeEventHandler<HTMLInputElement> | undefined
```

The part we want is this: `React.ChangeEventHandler<HTMLInputElement>`.

We can use that to type our `onChange` function:

```tsx twoslash
import React from "react";

const onChange: React.ChangeEventHandler<
  HTMLInputElement
> = (e) => {
  console.log(e);
};

<input onChange={onChange} />;
```

## Solution 2: Inline A Function, Then Type The Event

Sometimes, you don't want to type the entire function. You just want to type the event.

To extract the right event type, you need to do a slightly different dance.

First, create an inline function inside `onChange`.

```tsx twoslash
<input onChange={(e) => {}} />
```

Now you have access to `e`, you can hover over it and get the correct event type:

```tsx twoslash
<input onChange={(e) => {}} />
//                ^?
```

Finally, you can copy that type and use it to type your `onChange` function:

```tsx twoslash
import React from "react";

const onChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  console.log(e);
};

<input onChange={onChange} />;
```

This still feels slow, though. Is there a better way?

## Solution 3: Use `React.ComponentProps`

A way to speed this up would be to remove the step where we _check_ the type of the handler. It would be great to say 'I want this sort of handler type' and have TypeScript figure out the rest.

For this, we can use a type helper called `ComponentProps`, which I've [written about before](https://www.totaltypescript.com/react-component-props-type-helper).

```tsx twoslash
import React from "react";

const onChange: React.ComponentProps<"input">["onChange"] =
  (e) => {
    console.log(e);
  };

<input onChange={onChange} />;
```

By passing `input` to `ComponentProps`, we're telling TypeScript that we want the props for the `input` element.

Then, we grab the `onChange` property from those props, and use it to type our function.

Thanks to [Sebastien Lorber](https://twitter.com/sebastienlorber/status/1512420374201446405) for this tip!

## Solution 4: Use An `EventFrom` Helper

This is really nice, but we're still back to having to type the `onChange` function.

What if we want to extract just the event type?

We could use a combination of `Parameters`, `NonNullable`, and indexed access types to get there:

```tsx twoslash
import React from "react";

const onChange = (
  e: Parameters<
    NonNullable<React.ComponentProps<"input">["onChange"]>
  >[0]
) => {};
```

But that's far too much code to write.

Instead, let's imagine a type helper called `EventFor`:

```tsx twoslash
import React from "react";

type GetEventHandlers<
  T extends keyof JSX.IntrinsicElements
> = Extract<keyof JSX.IntrinsicElements[T], `on${string}`>;

/**
 * Provides the event type for a given element and handler.
 *
 * @example
 *
 * type MyEvent = EventFor<"input", "onChange">;
 */
export type EventFor<
  TElement extends keyof JSX.IntrinsicElements,
  THandler extends GetEventHandlers<TElement>
> = JSX.IntrinsicElements[TElement][THandler] extends
  | ((e: infer TEvent) => any)
  | undefined
  ? TEvent
  : never;

// ---cut---

const onChange = (e: EventFor<"input", "onChange">) => {
  console.log(e);
};

<input onChange={onChange} />;
```

This takes in the element type and the handler type, and returns the event type. You get autocomplete on each of the parameters, and you don't have to type the function.

The issue is, you need to keep a relatively large type helper in your codebase. Here's the code:

```ts twoslash
import React from "react";

// ---cut---

type GetEventHandlers<
  T extends keyof JSX.IntrinsicElements
> = Extract<keyof JSX.IntrinsicElements[T], `on${string}`>;

/**
 * Provides the event type for a given element and handler.
 *
 * @example
 *
 * type MyEvent = EventFor<"input", "onChange">;
 */
export type EventFor<
  TElement extends keyof JSX.IntrinsicElements,
  THandler extends GetEventHandlers<TElement>
> = JSX.IntrinsicElements[TElement][THandler] extends
  | ((e: infer TEvent) => any)
  | undefined
  ? TEvent
  : never;
```

## Which Solution Should You Use?

Personally, I prefer the `EventFor` solution. That might be because I came up with it, but here's why I like it:

- It's a single place you can go to get the event type for any element and handler
- You get autocomplete on the element and handler types
- I tend to prefer typing the event over typing the function - just muscle memory

But, if you don't want to keep a type helper around, the `ComponentProps` solution is a great alternative.
