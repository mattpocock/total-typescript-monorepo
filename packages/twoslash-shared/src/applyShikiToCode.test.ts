import { expect, it } from "vitest";
import { applyShikiToCode } from "./applyShikiToCode.js";

it("Should fail when a code sample has an unexpected error in it", async () => {
  const code = `
    const a: string = 1;
    `;

  const result = await applyShikiToCode({
    code,
    lang: "ts",
  });

  expect(result.success).toEqual(false);
  expect((result as any).recommendation).toMatchInlineSnapshot(`
    "Compiler Errors:

    index.ts
      [2322] 11 - Type 'number' is not assignable to type 'string'."
  `);
});

it("Should succeed when a code sample has a handled error in it", async () => {
  const code = `// @errors: 2322
    const a: string = 1;
    `;

  const result = await applyShikiToCode({
    code,
    lang: "ts",
  });

  expect(result.success).toEqual(true);
});
