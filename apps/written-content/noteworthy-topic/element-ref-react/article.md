Using `useRef` with native elements can be a bit of a pain. You need to specify the type of the element you're targeting, but it's not always clear what type you should be using.

```tsx twoslash
type NoIdeaWhatGoesHere = any;

// ---cut---

import { useRef } from "react";

const Component = () => {
  // What goes here?
  const audioRef = useRef<NoIdeaWhatGoesHere>(null);

  return <audio ref={audioRef}>Hello</audio>;
};
```

A simple solution is to hover over the type of `ref` to check what it accepts:

```tsx twoslash
import { useRef } from "react";

const Component = () => {
  // What goes here?
  const audioRef = useRef<HTMLAudioElement>(null);

  return <audio ref={audioRef}>Hello</audio>;
  //            ^?
};
```

But there's an easier way.

## What is `ElementRef`?

You can use `ElementRef`, a type helper from React, to easily extract the type from the element you're targeting.

```tsx twoslash
import { useRef, ElementRef } from "react";

const Component = () => {
  const audioRef = useRef<ElementRef<"audio">>(null);

  return <audio ref={audioRef}>Hello</audio>;
};
```

This even works with custom components that use `forwardRef`. You can use `typeof` to pass them to `ElementRef`, and it'll extract the type of the element that the component is forwarding to.

```tsx twoslash
// @filename: other-component.tsx
import React, { forwardRef } from "react";

export const OtherComponent = forwardRef<
  HTMLTableElement,
  { children: React.ReactNode }
>(({ children }, ref) => {
  return <table ref={ref}>{children}</table>;
});

// @filename: index.tsx

// ---cut---

import { OtherComponent } from "./other-component";
import React, { useRef, ElementRef } from "react";

// Pass it in via typeof!
type OtherComponentRef = ElementRef<typeof OtherComponent>;

const Component = () => {
  const ref = useRef<OtherComponentRef>(null);

  return <OtherComponent ref={ref}>Hello</OtherComponent>;
};
```

If you're using the previous solution (with `HTMLAudioElement` or `HTMLDivElement`, etc.), there's no reason to change it. But if you're ever unsure what type to use, `ElementRef` is a great helper.

And if you want more tips like this, check out my free [React and TypeScript beginner's course](https://www.totaltypescript.com/tutorials/react-with-typescript). There are 21 interactive exercises packed with TypeScript tips and tricks for React apps.
