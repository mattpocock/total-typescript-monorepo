import { expect, it } from "vitest";
import { parseExercisePath } from "../paths.js";
import type { AbsolutePath } from "../types.js";

it.each([
  ["/home/matt/01-foo/02-bar/index.ts", "/home/matt/01-foo/02-bar", "02"],
  ["/home/matt/01-foo/index.json", "/home/matt/01-foo", "01"],
  ["/home/matt/001-foo/index.json", "/home/matt/001-foo", "001"],
  [
    "/home/matt/001-foo/04-exercise.ts",
    "/home/matt/001-foo/04-exercise.ts",
    "04",
  ],
  [
    "/home/matt/001-foo/005-exercise.ts",
    "/home/matt/001-foo/005-exercise.ts",
    "005",
  ],
])(
  "parseExercisePath should resolve the correct information",
  (input, expectedResolvedPath, num) => {
    const result = parseExercisePath(input as AbsolutePath);

    expect(result).toMatchObject({
      resolvedPath: expectedResolvedPath,
      num,
    });
  },
);
