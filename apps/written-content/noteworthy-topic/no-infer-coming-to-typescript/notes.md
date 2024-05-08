```ts twoslash
// @noErrors: 2322
type NoInfer<T> = [T][T extends any ? 0 : never];

// ---cut---

// BEFORE

declare function createFSM<TState extends string>(config: {
  // Without NoInfer, TS doesn't know which
  // TState is the source of truth
  initial: NoInfer<TState>;
  states: TState[];
}): TState;

const example1 = createFSM({
  initial: "",
  //        ^|
  states: ["open", "closed"],
});
```
