import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const getTemporaryDirectory = () => {
  const prefix = path.join(tmpdir(), "playground-");

  return mkdtempSync(prefix);
};

// Run with --experimental-print-required-tla to catch this!
// await fetch("https://google.com");
