type NoInfer<T> = [T][T extends any ? 0 : never];

// BEFORE

declare function createFSM<TState extends string>(config: {
  // Without NoInfer, TS doesn't know which
  // TState is the source of truth
  initial: NoInfer<TState>;
  states: TState[];
}): TState;

const example1 = createFSM({
  // 'initial' is allowed to be any string
  initial: "not-allowed",
  states: ["open", "closed"],
});

// AFTER

declare function createFSM2<TState extends string>(config: {
  // With NoInfer, 'initial' is removed
  // as a candidate!
  initial: NoInfer<TState>;
  states: TState[];
}): TState;

createFSM2({
  initial: "not-allowed",
  states: ["open", "closed"],
});
