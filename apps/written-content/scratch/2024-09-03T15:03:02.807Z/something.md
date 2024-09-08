```ts twoslash
import { useRef } from "react";

const ref = useRef<HTMLDivElement>(null!);

const element = ref.current;
//    ^?
```

```ts twoslash
fetch(null!); // No error!

JSON.parse(null!); // No error!

const obj: Response = null!; // No error!
```
