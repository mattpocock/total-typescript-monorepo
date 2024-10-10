```ts twoslash
// oh-dear.ts
const OH_DEAR = 'OH_NOOOOOOO';
export { OH_DEAR as "😱" };
```

```ts twoslash
// @filename: oh-dear.ts
const OH_DEAR = 'OH_NOOOOOOO';
export { OH_DEAR as "😱" };

// @filename: index.ts
// ---cut---
import { "😱" as ouch } from "./oh-dear.js";

console.log(ouch);
//          ^?
```
