```ts twoslash
// BEFORE

const map = new Map();

const result = map.get("abc");
//    ^?
```

```ts twoslash
import "@total-typescript/ts-reset/map-constructor";
// ---cut---
// AFTER

const map = new Map();

const result = map.get("abc");
//    ^?
```
