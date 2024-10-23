import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

// Version 1

const createTemporaryDirectory = () => {
  const path = mkdtempSync(tmpdir());

  return {
    path,
    dispose: () =>
      rmSync(path, { recursive: true, force: true }),
  };
};

const myFunc = () => {
  const directory = createTemporaryDirectory();

  // Lame, because we need to manually dispose it
  directory.dispose();
};
