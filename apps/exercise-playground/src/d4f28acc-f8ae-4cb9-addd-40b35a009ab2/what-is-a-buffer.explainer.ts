// http://localhost:3004/courses/exercises/d4f28acc-f8ae-4cb9-addd-40b35a009ab2/edit

import { expect, it } from "vitest";

const buffer = Buffer.from([0, 255]);

it("Should be a buffer containing [0, 255]", () => {
  expect(buffer[0]).toBe(0);
  expect(buffer[1]).toBe(255);
});

it("Should be an instance of Uint8Array", () => {
  expect(buffer instanceof Uint8Array).toBe(true);
});

// All the usual array methods!
buffer.find;
buffer.findIndex;
buffer.includes;
buffer.filter;

// Except for the ones that mutate the array.
buffer.push;

it("Should be able to change the first byte to 20", () => {
  // Buffers can be mutated, though:
  buffer[0] = 20;

  expect(buffer[0]).toBe(20);
});

// You can also iterate over a buffer!
for (const byte of buffer) {
  console.log(byte);
}
