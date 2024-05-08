// EXAMPLE 1:

const scores: Record<string, number> = {};

scores.english = 100;
scores.maths = 100;

// EXAMPLE 2:

const config = {
  wide: "100px",
  narrow: 0,
} satisfies Record<string, string | number>;

console.log(config.wide);
//                 ^?

console.log(config.narrow);
//                 ^?
