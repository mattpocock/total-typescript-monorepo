```ts twoslash
// @errors: 2349
import { useState } from "react";

// ---cut---

const useCustomHook = () => {
  const [state, setState] = useState("123");

  return [state, setState];
};
```

```ts twoslash
// @errors: 2349
import { useState } from "react";

const useCustomHook = () => {
  const [state, setState] = useState("123");

  return [state, setState];
};

// ---cut---

const [state, setState] = useCustomHook();

setState("abc");
```

```ts twoslash
// @errors: 2349
import { useState } from "react";

// ---cut---

const useCustomHook = () => {
  const [state, setState] = useState("123");

  return [state, setState] as const;
};

const [state, setState] = useCustomHook();

setState("abc");
```
