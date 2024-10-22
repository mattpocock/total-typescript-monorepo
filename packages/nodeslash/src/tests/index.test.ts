import { expect, it } from "vitest";
import { applyNodeslash } from "../index.js";

it("Should log a simple example", async () => {
  const code = `
    console.log("Hello, world!");
  `;

  const result = await applyNodeslash(code);

  expect(result.terminalOutput).toMatch("Hello, world!");
});

it("Should display an error if there is an exception", async () => {
  const code = `
    throw new Error('Oh dear');
  `;

  const result = await applyNodeslash(code);

  expect(result.terminalOutput).toMatch(`throw new Error('Oh dear');`);
});
