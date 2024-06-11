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

it.only("REPL", async () => {
  const markdown = [
    "```ts twoslash",
    "const a = 1;",
    "const b = 2;",
    "```",
    "",
    "```ts",
    "const a = 1;",
    "const b = 2;",
    "```",
  ].join("\n");

  const result = await applyShikiToMarkdownFile(markdown);

  expect(result).toMatchInlineSnapshot(`
    {
      "html": "",
      "snippets": [
        {
          "rawHtml": "DwBwTgpgBAxgNgQwM5ILwCIkAsCWBrHKAEwTDwFoQ4BXJKAFwHcB7JRbKOJEdKJegJ5wIGAEYIYeAOZhm1AHZFyMZnGZgAXAGIAjAFF9+gNwq1mrQBEALNeu96CUTkUQAHhgAM6AHzAVRCF9uBHlYdjR0OGcIH2Bg0P4hEXRTdW0AVgA2AE4AYQtMnxV5fmAAenigkBC+QWEMVPMrADFcnWbmnyhyyrjqhLrkxu0Wto7YkgdyLhBObgbmEvooBA0oHR8EcsmEae5fCv6qmsT6lNU0yxtrrtRuw5DjgaSFs20AIXTcvQBBAA4fDoekc+idBq9LrYbt4jMDHnD5N4AFCg0LwZARKLyGJPWovc5vLRZPIFIqLUoPRGovFnYZaUbtTree69eI0oYXJqtRkTBBTGZzEALJZQURrABMPlE2z5uxmB1Z-XZEPMULszLuCNxpw5hM+33+PnFWupOpV2jVVh8sMpCpBZX8gXK4ECQA",
        },
        {
          "rawHtml": "DwBwTgpgBAxgNgQwM5ILwCIkAsCWBrHKAEwTDwFoQ4BXJdKJAFwE84IMAjBGPAczAD21AHZFyMAXAFgAXAGIAjAFFlygNwSpsuQBEALPv31GCDjlEQAHhgAM6AHzAJRCI6QgEw2IhQY45iAdgd08GFjYMTWl5AFYANgBOAGEdOIcJYSZgAHoQ4TcPLyZWdnQo7T0AMSSFSsqHKAQcvILQ4oiyyWjdA16G1Chmwtai8NLy+QAhGKSlAEEADgcFIc8RsJLIru1DPvs1VfzD+wAoYMLvZDR0f2FA9fbx7djElLT7DKzc4fO2sa2tPIqjU6g0OMdfqNNp1AT1dv1Bt81pCNh0JnJprNFg4AEwQvKop6w3ZGfYQpFHbLOVw5cCuIA",
        },
      ],
    }
  `);
});
