```tsx !!
import { useRef } from "react";

// ---cut---
// Imagine that we're using useRef to grab
// the reference to a div.
const ref = useRef(null);
```

```tsx !!
import { useRef } from "react";

// ---cut---
const ref = useRef(null);

// We can pass the ref directly to the div...
<div ref={ref} />;
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
const ref = useRef(null);

useEffect(() => {
  // But when we try to use our ref, it's
  // always null...
  ref.current;
  //  ^?
}, []);

<div ref={ref} />;
```

```tsx !!
// @noErrors
import { useEffect, useRef } from "react";

// ---cut---
// We need to pass some type into the useRef
// to avoid the error, but what type should
// it be?
const ref = useRef<SomeType>(null);

useEffect(() => {
  ref.current;
}, []);

<div ref={ref} />;
```

```tsx !!
// @noErrors
import { useEffect, useRef } from "react";

// ---cut---
const ref = useRef<SomeType>(null);

useEffect(() => {
  ref.current;
}, []);

// We can figure this out by hovering over
// ref and spotting HTMLDivElement in the
// readout
<div ref={ref} />;
//   ^?
```

```tsx !!
// @noErrors
import { useEffect, useRef } from "react";

// ---cut---
// We can put it up here...
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  ref.current;
}, []);

<div ref={ref} />;
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  // And now, our ref is correctly typed.
  ref.current;
  //  ^?
}, []);

<div ref={ref} />;
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
// But there's a simpler way...
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  ref.current;
}, []);

<div ref={ref} />;
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
// We can use React.ElementRef, passing in
// the type of the element we want to reference.
const ref = useRef<React.ElementRef<"div">>(null);

useEffect(() => {
  ref.current;
}, []);

<div ref={ref} />;
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
const ref = useRef<React.ElementRef<"div">>(null);

useEffect(() => {
  // And our ref is still typed properly!
  ref.current;
  //  ^?
}, []);

<div ref={ref} />;
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
// This should save you some steps when
// trying to figure out what type a ref
// should be.
type Element = React.ElementRef<"div">;
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
// You can do any DOM element:
type Element = React.ElementRef<"audio">;
//   ^?
```

```tsx !!
import { useEffect, useRef } from "react";

// ---cut---
// Any SVG element:
type Element = React.ElementRef<"path">;
//   ^?
```

```tsx !!
import { useEffect, useRef } from "react";

declare const Table: React.FC<{
  ref: React.Ref<HTMLTableElement>;
}>;

// ---cut---
// And even any custom components!
type Element = React.ElementRef<typeof Table>;
//   ^?
```
