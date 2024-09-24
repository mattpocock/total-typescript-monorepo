import { describe, expect, it } from "vitest";
import { createVSCodeFilename } from "../app/utils";

describe("createVSCodeFilename", () => {
  it.each([
    ["Input", "input"],
    ["abcWow", "abcwow"],
    ["The 'node:' Prefix", "the-node-prefix"],
    ["What Is A Buffer?", "what-is-a-buffer"],
    [
      "Uint16Arrays, Uint32Arrays and Uint64Arrays",
      "uint16arrays-uint32arrays-and-uint64arrays",
    ],
  ])("Should work", (input: string, output: string) => {
    expect(createVSCodeFilename(input)).toBe(output);
  });
});
