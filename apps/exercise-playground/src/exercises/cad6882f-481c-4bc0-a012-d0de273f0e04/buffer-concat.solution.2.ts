// http://localhost:3004/courses/exercises/cad6882f-481c-4bc0-a012-d0de273f0e04/edit

import { expect, it } from "vitest";

const buffer = Buffer.from([0, 1, 2]);

const newBuffer = Buffer.concat([buffer, new Uint8Array([3, 4])]);

it("Should have a length of 5", () => {
  expect(newBuffer.length).toBe(5);
});
