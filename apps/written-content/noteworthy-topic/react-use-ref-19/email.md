---
height: 700
---

```ts !!
import { useRef } from "react";

// ---cut---
// In React 18, you could call useRef without
// passing any arguments.
const ref = useRef();
```

```ts !!
import { useRef } from "react";

// ---cut---
// You could pass a type argument to specify
// what the ref should contain:
const ref = useRef<string>();
```

```ts !!
import { useRef } from "react";

// ---cut---
// And the ref would be typed as what you passed,
// plus undefined.
const ref = useRef<string>();

console.log(ref.current);
//              ^?
```

```ts !!
import { useRef } from "react";

// ---cut---
// If you passed null as an initial value, you'd
// get a bizarre behavior...
const ref = useRef<string>(null);

// Where the ref would be string | null...
console.log(ref.current);
//              ^?
```

```ts !!
// @errors: 2540
import { useRef } from "react";

// ---cut---
const ref = useRef<string>(null);

// ...but it could never be mutated. WTF!
ref.current = "hello";
```

```ts !!
// @errors: 2554
declare const useRef: <T>(initialValue: T) => {
  current: T;
};
// ---cut---
// In React 19, useRef will require an initial value.
const ref = useRef<string>();

console.log(ref.current);
```

```ts !!
declare const useRef: <T>(initialValue: T) => {
  current: T;
};
// ---cut---
// So, you'll need to pass an initial value,
// and the ref will be typed as that value:
const ref = useRef<string | null>(null);

// This means no more weird immutability...
console.log(ref.current);
//              ^?
```

```ts !!
declare const createContext: <T>(initial: T) => T;

declare const useContext: <T>(context: T) => T;

// ---cut---
// ...and makes it more consistent with other
// React API's, like createContext.
const context = createContext<string | null>(null);

const result = useContext(context);
//    ^?
```
