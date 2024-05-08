type Fruit =
  | "apple"
  | "orange"
  | "lemon";

type CitrusFruit = Exclude<
  Fruit,
  "apple"
>;
