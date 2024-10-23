import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

// Version 2

const createTemporaryDirectory2 = () => {
  const path = mkdtempSync(tmpdir());

  return {
    path,
    [Symbol.dispose]: () =>
      rmSync(path, { recursive: true, force: true }),
  };
};

const myFunc = () => {
  // Automatically disposed when it leaves scope!
  using directory2 = createTemporaryDirectory2();
};
