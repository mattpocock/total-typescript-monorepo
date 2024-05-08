```ts twoslash
// @errors: 2322
type Person = {
  id: string;
  name: string;
};
// ---cut---

// ⛔️ keyof T[] is BAD
const personKeys: keyof Person[] = ["id", "name"];

// ✅ keyof Array<T> is BETTER
const personKeys2: Array<keyof Person> = [
  "id",
  "name",
];
```

```ts twoslash
// TypeScript ALWAYS uses T[] in errors/hovers:
const arr = ["hello", "world"];
//    ^?

// Even for readonly arrays:
const arrAsConst = ["hello", "world"] as const;
//    ^?
```
