```jsx twoslash
// @checkJs: true
// @errors: 2352
import { useState } from "react";

// Not safe!
const [message, setMessage] = useState(
  /** @type {string} */ (1)
);
```

```jsx twoslash
// @checkJs: true
import { useState } from "react";

/**
 * @template T
 * @typedef {[T, React.Dispatch<React.SetStateAction<T>>]} StateTuple
 */

/** @type {StateTuple<string | undefined>} */
const [message, setMessage] = useState();
//     ^?
```

https://twitter.com/giltayar/status/1682262953163202561
