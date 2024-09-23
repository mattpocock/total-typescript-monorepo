// http://localhost:3004/courses/exercises/1a4bf5d2-6909-4e4c-bc31-e430409c8228/edit

import { expect, it } from "vitest";

const uint16Array = new Uint16Array([0, 65535]);
const uint32Array = new Uint32Array([0, 4294967295]);

it("should return the same values when they're within legal bounds", () => {
  expect(uint16Array[0]).toBe(0);
  expect(uint16Array[1]).toBe(65535);

  expect(uint32Array[0]).toBe(0);
  expect(uint32Array[1]).toBe(4294967295);
});

const badUint16Array = new Uint16Array([-1, 65536]);
const badUint32Array = new Uint32Array([-1, 4294967296]);

it("should return different values when they're outside legal bounds", () => {
  // -1 resolves to 65535
  expect(badUint16Array[0]).toBe(65535);

  // 65536 resolves to 0
  expect(badUint16Array[1]).toBe(0);

  // -1 resolves to 4294967295
  expect(badUint32Array[0]).toBe(4294967295);

  // 4294967296 resolves to 0
  expect(badUint32Array[1]).toBe(0);
});
