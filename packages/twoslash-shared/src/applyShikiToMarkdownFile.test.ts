import { expect, it } from "vitest";
import { applyShikiToMarkdownFile } from "./index.js";

// it("Should throw when errors are not marked", async () => {
//   const markdown = [
//     "```ts twoslash",
//     "const a: string = 1;",
//     "const b: string = 2;",
//     "```",
//   ].join("\n");

//   await expect(() =>
//     applyShikiToMarkdownFile(markdown),
//   ).rejects.toThrowErrorMatchingInlineSnapshot(
//     `[Error: Errors were thrown in the sample, but not included in an error tag]`,
//   );
// });

it("Should show TS errors", async () => {
  const markdown = [
    "```ts twoslash",
    "// @errors: 2322",
    "const a = 1;",
    "//    ^?",
    "const b: string = 2;",
    "```",
    "",
    "Hello world!",
    "",
    "```ts",
    "const a = 1;",
    "const b = 2;",
    "```",
  ].join("\n");

  const result = await applyShikiToMarkdownFile(markdown);

  expect(result.html).toContain(
    "Type 'number' is not assignable to type 'string'.",
  );

  expect(result.snippets).toHaveLength(1);
});
