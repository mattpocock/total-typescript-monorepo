type InferValueFromColor<Color extends string> =
  Color extends `${infer N}-${infer C}-${infer T}`
    ? {
        namespace: N;
        color: C;
        tone: T;
      }
    : never;

type Example = InferValueFromColor<"text-red-300">;
//   ^?
