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

https://www.typescriptlang.org/play?#code/C4TwDgpgBAcg9gSQHYDMICcA8AVAfFAXigG1sBdUqCAD2AiQBMBnKAQyRCgH4oAGKAFxQkEAG4YyAbgBQ0gJZI66FKwDG0AGIBXJKqgBvaVCg4qtesyhNg6BQHMoAH2FaAtgCMMuABRh0cMCYhQ2NjUVYAGy0IIWwZUKg4JABhAAt2Oxiob1YheGQ0LDwASkJ8JC0IiPioAF9ioQqqmVrZVSTrKGStazhXIW1dQmy-AKZSgnwQqHakJjgIiAA6CLg7X39ApfCoiAAaKFGtpLSMiGKa9AhgLXQkF2bpWplpWc6d6OGARhfu3tdvNMPlkvnsjIkUukkJkhDkhNZbNCJuVKhEwfUZEA
