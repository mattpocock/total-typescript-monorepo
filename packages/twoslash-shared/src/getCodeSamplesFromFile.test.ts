import { expect, it } from "vitest";
import { getCodeSamplesFromFile } from "./getCodeSamplesFromFile.js";

it("Should return the correct sections for a markdown string", () => {
  const markdown = `
  \`\`\`ts twoslash
  const a = 1;
  \`\`\`

  \`\`\`ts twoslash
  const b = 2;
  \`\`\`
  `;

  const result = Array.from(getCodeSamplesFromFile(markdown));

  expect(result).toEqual([
    {
      code: `  const a = 1;`,
      lang: "ts",
    },
    {
      code: `  const b = 2;`,
      lang: "ts",
    },
  ]);
});
