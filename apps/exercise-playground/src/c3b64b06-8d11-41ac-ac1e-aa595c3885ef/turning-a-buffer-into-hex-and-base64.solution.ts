// http://localhost:3004/courses/exercises/c3b64b06-8d11-41ac-ac1e-aa595c3885ef/edit

import { expect, it } from "vitest";

const buf = Buffer.from([1, 2, 3, 4]);

const hex = buf.toString("hex");

it("Should be transformed into a hex code", () => {
  expect(hex).toEqual("01020304");
});

const finalBuffer = Buffer.from(hex, "hex");

it("Should return the same buffer after re-encoding", () => {
  expect(finalBuffer).toEqual(buf);
});
