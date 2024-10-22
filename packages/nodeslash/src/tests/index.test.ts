import { expect, it } from "vitest";
import { applyNodeslash } from "../index.js";

it("Should log a simple example", async () => {
  const code = `
    console.log("Hello, world!");
  `;

  const result = await applyNodeslash(code);

  expect(result.terminalOutput).toEqual("Hello, world!");
});

it("Should display an error if there is an exception", async () => {
  const code = `
    throw new Error('Oh dear');
  `;

  const result = await applyNodeslash(code);

  expect(result.terminalOutput).toMatch(`throw new Error('Oh dear');`);

  expect(result.terminalOutput).toMatchInlineSnapshot(`
    "Command failed: node --experimental-strip-types index.js
        throw new Error('Oh dear');
              ^

    Error: Oh dear
    [90m    at ModuleJob.run (node:internal/modules/esm/module_job:262:25)[39m
    [90m    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:482:26)[39m
    [90m    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)[39m

    Node.js v22.6.0"
  `);
});
