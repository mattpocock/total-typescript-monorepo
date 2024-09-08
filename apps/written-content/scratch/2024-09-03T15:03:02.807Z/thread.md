React 19 fixed a WEIRD typing issue with useRef.

But the fix introduced another weird issue.

This is worth a deep dive 🧵

```ts twoslash
// @errors: 2540
type RefObject<T> = {
  readonly current: T;
};
declare const useRef: <T>(input: any) => RefObject<T>;

// ---cut---
// Old issue: random readonliness
const ref = useRef<string>(null);

ref.current = "abc";
```

```ts twoslash
// @errors: 2540
type RefObject<T> = {
  current: T;
};
declare const useRef: <T>(input: T) => RefObject<T>;

// ---cut---
// New issue: declaring HTML elements
// is verbose
const ref = useRef<HTMLDivElement>(
  null as unknown as HTMLDivElement,
);
```

---

React 18 had some bizarre typing behavior with `useState`.
