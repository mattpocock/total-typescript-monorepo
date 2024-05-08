type Fruit =
  | "apple"
  | "orange"
  | "lemon";

type CitrusFruit = Omit<
  Fruit,
  "apple"
>;
