// http://localhost:3004/courses/exercises/65ceb568-c50d-4da3-8de3-26e0cf898544/edit

import { expect, it } from "vitest";

const emptyBufferWithLength10 = Buffer.alloc(10);

it("Should have length 10", () => {
  expect(emptyBufferWithLength10.length).toBe(10);
});

it("Should contain empty bits", () => {
  expect(emptyBufferWithLength10).toEqual(
    Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  );
});

const unsafeBuffer = Buffer.allocUnsafe(10);

it("Should have length 10", () => {
  expect(unsafeBuffer.length).toBe(10);
});

it("May contain random bits", () => {
  // This test will probably fail - the buffer may contain random bits,
  // but it very rarely does.
  expect(unsafeBuffer).not.toEqual(Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
});
