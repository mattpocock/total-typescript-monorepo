import { describe, expect, it } from "vitest";
import { sanitizeForVSCodeFilename } from "../app/utils";

describe("sanitizeForVSCodeFilename", () => {
  it.each([
    ["Input", "input"],
    ["abcWow", "abcwow"],
    ["The 'node:' Prefix", "the-node-prefix"],
    ["What Is A Buffer?", "what-is-a-buffer"],
    [
      "Uint16Arrays, Uint32Arrays and Uint64Arrays",
      "uint16arrays-uint32arrays-and-uint64arrays",
    ],
    ["trpc's Adapters", "trpcs-adapters"],
  ])("%o -> %o", (input: string, output: string) => {
    expect(sanitizeForVSCodeFilename(input)).toBe(output);
  });
});
