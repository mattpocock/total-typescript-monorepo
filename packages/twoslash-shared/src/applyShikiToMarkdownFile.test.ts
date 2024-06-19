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

it("REPL", async () => {
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

  expect(result).toMatchInlineSnapshot(`
    {
      "html": "<pre class="shiki dark-plus twoslash lsp not-prose" style="background-color:#1E1E1E;color:#D4D4D4" tabindex="0"><code><span class="line"><span style="color:#569CD6">const</span><span style="color:#4FC1FF"> </span><span style="color:#4FC1FF"><data-lsp lsp="const a: 1">a</data-lsp></span><span style="color:#D4D4D4"> = </span><span style="color:#B5CEA8">1</span><span style="color:#D4D4D4">;</span></span><div class="meta-line">     <span class="popover"><div class="arrow"></div>const a: 1</span></div><span class="line"><span style="color:#569CD6">const</span><span style="color:#4FC1FF"> </span><span style="color:#4FC1FF"><data-err>b</data-err></span><span style="color:#D4D4D4">: </span><span style="color:#4EC9B0">string</span><span style="color:#D4D4D4"> = </span><span style="color:#B5CEA8">2</span><span style="color:#D4D4D4">;</span></span><div class="error"><span>Type 'number' is not assignable to type 'string'.</span><span class="code">2322</span></div><span class="error-behind">Type 'number' is not assignable to type 'string'.</span><span class="line"></span></code></pre>
    <p>Hello world!</p>
    <pre class="shiki dark-plus" style="background-color:#1E1E1E;color:#D4D4D4" tabindex="0"><code><span class="line"><span style="color:#569CD6">const</span><span style="color:#4FC1FF"> a</span><span style="color:#D4D4D4"> = </span><span style="color:#B5CEA8">1</span><span style="color:#D4D4D4">;</span></span>
    <span class="line"><span style="color:#569CD6">const</span><span style="color:#4FC1FF"> b</span><span style="color:#D4D4D4"> = </span><span style="color:#B5CEA8">2</span><span style="color:#D4D4D4">;</span></span>
    <span class="line"></span></code></pre>",
      "snippets": [
        {
          "rawHtml": "DwBwTgpgBAxgNgQwM5ILwCIkAsCWBrHKAEwTDwFoQ4BXJKAFwHcB7JRbKOJEKAO2fqUwrCOihJ6ATzgQMAIwQw8Ac2HVeRcjGZxmYAFwBiAIwBRM2YDc23QcMARACxOnY+gjk4NEAB4YADOgAfMDaRBAh3Ai8sOxo6HBeopEg0eJSMhg2ekYArABsAJwAwvb5wdq8EsAA9FG8KWkS0rLo2XaOAGLFxp2dwVC19Y0xzZltOjmGXT19wcAk7uRcPCtZzFX0UAj6UMbBCLWLCMvcIXWpDcD16S3rtkYuzo4DqIMX0SO34+1GAEK5YqmACCAA5gsYhpcvmNWr8HM9XEFLFDPqirkQcAA3WLIeIAWwgS0SvGSUHJ5Oul1xKAwIGY9KxEDA80xOPgeIwpGEjHmNTZQUqEm2u0hHyu-OxXw5tISSXmN1h9ymBRKZQqG2q4phGThkw63V6-SC72GVKauuVBtmxoWCCWzLAQTkR3tJ0d5zNistEweCKewV26J1d19U0cpmKhT+gSCEjAXmUwfNox98KeSKgb2T3tD8IBQLBwQATDnqUqw3YMy9kcntQtsTT4o69AroQAVSQgaAAcl41HxcmZPagODo-C2eJwyl4HhkDGYDC7vfjiZ7ADoy2kZfEwsliwBmYul+uSrHSuIYFtgchD3AaYKd7tQPsDodgEdjvgCbYoaezuR53oRcpGfHtV14ZQNy3GIdwwElkjrPdznACIgA",
        },
      ],
    }
  `);
});
