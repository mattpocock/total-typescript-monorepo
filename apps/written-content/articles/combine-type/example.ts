// CODE

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type Combine<T1, T2> = Prettify<
  {
    [K in keyof (T1 | T2)]: T1[K] | T2[K];
  } & Partial<T1 & T2>
>;

// TESTS

import { Equal, Expect } from "@total-typescript/helpers";

type TypeA = {
  readonly name: string;
  readonly address: string;
};

type TypeB = { readonly name: string; phone: string };

type Result = Combine<TypeA, TypeB>;

type Expected = {
  readonly name: string;
  readonly address?: string;
  phone?: string;
};

type test = Expect<Equal<Result, Expected>>;
