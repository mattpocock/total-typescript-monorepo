// Step 1: build a Merge type helper

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type Merge<T1, T2> = Prettify<Omit<T1, keyof T2> & T2>;

type Example = Merge<
  { foo: string; bar: string },
  { foo: number }
>;

// Step 2: build a merge array of objects type helper

type MergeArrayOfObjects<
  TArr extends readonly object[],
  T1 = {},
> = TArr extends [
  infer T2 extends object,
  ...infer TRest extends object[],
]
  ? MergeArrayOfObjects<TRest, Merge<T1, T2>>
  : T1;

type Example2 = MergeArrayOfObjects<
  [
    { foo: boolean; baz: string },
    { foo: number },
    { foo: string; bar: string },
  ]
>;

// Step 3: map this onto a function

const merge = <TArr extends readonly object[]>(
  ...objects: TArr
): MergeArrayOfObjects<TArr> => {
  return Object.assign({}, ...objects);
};

const example3 = merge(
  { foo: 123 },
  { foo: true, baz: "abc" },
  { foo: "abc", bar: 123 },
);
