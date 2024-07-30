```ts twoslash
import { useEffect } from "react";

// ---cut---
useEffect(() => {
  // 1. Create a new abort controller...
  const abortController = new AbortController();

  document.addEventListener(
    "click",
    (e) => {
      console.log(e);
    },
    {
      // 2. ...pass it to the event listener...
      signal: abortController.signal,
    },
  );

  return () => {
    // 3. ...and remove it when the
    // component unmounts.
    abortController.abort();
  };
}, []);
```
