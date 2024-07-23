import { expect, it } from "vitest";
import { returnMarkdownHeadingsAndContents } from "../utils.js";

it("Should return the correct sections for a markdown string", () => {
  const markdown = `# First heading

This is the first heading

This is another part of the first heading

## Second heading

This is the second heading
`;

  const result = returnMarkdownHeadingsAndContents(markdown);

  expect(result).toEqual([
    {
      type: "heading-with-content",
      heading: "First heading",
      headingLevel: 1,
      content: `

This is the first heading

This is another part of the first heading
`,
      startIndex: 0,
    },
    {
      type: "heading-with-content",
      heading: "Second heading",
      headingLevel: 2,
      content: `

This is the second heading
`,
      startIndex: 6,
    },
  ]);
});

it("Should work when the first line is not a heading", () => {
  const markdown = `This is a line

# First heading
`;

  const result = returnMarkdownHeadingsAndContents(markdown);

  expect(result).toEqual([
    {
      type: "no-heading-content",
      content: `
This is a line
`,
      startIndex: 0,
    },
    {
      type: "heading-with-content",
      heading: "First heading",
      headingLevel: 1,
      content: `\n`,
      startIndex: 2,
    },
  ]);
});
