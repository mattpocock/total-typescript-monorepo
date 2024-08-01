```ts twoslash
import { useState } from "react";

// ---cut---
// BEFORE

// Without const T...
declare function useStatuses<T>(statuses: T[]): T;

// ...it gets inferred as just string
const loadingStatus = useStatuses(["loading", "idle"]);
//    ^?
```

```ts twoslash
import { useState } from "react";

// ---cut---
// AFTER

// But WITH const T...
declare function useStatuses2<const T>(statuses: T[]): T;

// ...it gets inferred as narrowly as possible.
const loadingStatus3 = useStatuses2(["loading", "idle"]);
//               ^?
```
