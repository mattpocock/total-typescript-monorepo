// http://localhost:3004/courses/exercises/20e2a3c9-c0c6-4ba5-9440-592462f74ba4/edit

import { expect, it } from "vitest";

const result = Buffer.from("abc", "utf-8");

it("Should have a length of 3", () => {
  expect(result.length).toBe(3);

  expect(result[0]).toBe(97);
  expect(result[1]).toBe(98);
  expect(result[2]).toBe(99);
});
