import { describe, expect, it } from "vitest";
import { getExerciseSuffix } from "../get-exercise-suffix";

describe("get-exercise-suffix", () => {
  it.each([
    ["introduction.explainer.ts", "explainer.ts"],
    ["001-something.solution.ts", "solution.ts"],
    ["001-something.solution.1.ts", "solution.1.ts"],
    ["001-something.solution.4.ts", "solution.4.ts"],
    ["001-something.problem.server.ts", "problem.server.ts"],
    ["001-something.problem.ts", "problem.ts"],
    ["001-problem-awesome-thing.problem.ts", "problem.ts"],
    ["001-problem-awesome-thing.problem.server.ts", "problem.server.ts"],
    ["001-problem-awesome-thing.ts", undefined],
  ])("%o should resolve to %o", (input, output) => {
    expect(getExerciseSuffix(input)).toBe(output);
  });
});
