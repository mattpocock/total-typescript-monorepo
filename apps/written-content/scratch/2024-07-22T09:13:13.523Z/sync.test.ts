import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { expect, it } from "vitest";

it.skip("should syncBuiltinESMExports", () => {
  fs.readFileSync = undefined;

  expect(fs.readFileSync).toBeUndefined();

  syncBuiltinESMExports();

  console.log(fs.readFileSync);

  expect(fs.readFileSync).toBeInstanceOf(Function);
});
