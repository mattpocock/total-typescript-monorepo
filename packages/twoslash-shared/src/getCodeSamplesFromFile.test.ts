import { expect, it } from "vitest";
import { getCodeSamplesFromFile } from "./getCodeSamplesFromFile.js";

it.each([
  [
    `
  \`\`\`ts twoslash
  const a = 1;
  \`\`\`

  \`\`\`ts twoslash
  const b = 2;
  \`\`\`
  `,
    [
      {
        code: `  const a = 1;`,
        lang: "ts",
        mode: "twoslash",
      },
      {
        code: `  const b = 2;`,
        lang: "ts",
        mode: "twoslash",
      },
    ],
  ],
])(
  "Should return the correct sections for a markdown string",
  (input, output) => {
    const result = Array.from(getCodeSamplesFromFile(input));

    expect(result).toMatchObject(output);
  }
);
