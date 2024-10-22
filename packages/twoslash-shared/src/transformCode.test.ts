import { assert, describe, expect, it } from "vitest";
import { transformCode } from "./transformCode.js";

describe("mode: twoslash", () => {
  it("Should fail when a code sample has a type error in it", async () => {
    const code = `
      const a: string = 1;
      `;

    const result = await transformCode({
      code,
      lang: "ts",
      mode: "twoslash",
    });

    expect(result.success).toEqual(false);
    expect((result as any).recommendation).toMatch(
      `Type 'number' is not assignable to type 'string'.`
    );
  });

  it("Should succeed when a code sample has a handled error in it", async () => {
    const code = `// @errors: 2322
      const a: string = 1;
      `;

    const result = await transformCode({
      code,
      lang: "ts",
      mode: "twoslash",
    });

    expect(result.success).toEqual(true);
  });
});

describe("mode: undefined", () => {
  it("Should NOT fail when a code sample has a type error in it", async () => {
    const code = `
      const a: string = 1;
      `;

    const result = await transformCode({
      code,
      lang: "ts",
      mode: undefined,
    });

    expect(result.success).toEqual(true);
  });
});

describe("mode: nodeslash", () => {
  it("Should fail when a code sample has a type error in it", async () => {
    const code = `
      const a: string = 1;
      `;

    const result = await transformCode({
      code,
      lang: "ts",
      mode: "nodeslash",
    });

    expect(result.success).toEqual(false);
  });

  it("Should produce multiple snippets", async () => {
    const code = `
      console.log('Hello, world!');
      `;

    const result = await transformCode({
      code,
      lang: "ts",
      mode: "nodeslash",
    });

    expect(result.success).toEqual(true);
    assert(result.success === true);
    expect(result.terminalText).toMatch("Hello, world!");
  });
});
