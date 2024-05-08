const set = new Set<string>(["a", "b", "c"]);

type SetConstructor = <T>(values?: T[] | null) => Set<T>;

const pick = <TObj, TPicked extends keyof TObj>(
  obj: TObj,
  picked: Array<TPicked>
): Pick<TObj, TPicked> => {
  return picked.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<TObj, TPicked>);
};

type Picked = Pick<{ a: number; b: number }, "a">;

type Example = { a: number };

const set = new Set<string | number>(["a", "b", "c", 123]);

const result = pick({ a: 123, b: 456 }, ["a"]);
