import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

// Version 3

const createTemporaryDirectory3 = async () => {
  const path = await mkdtemp(tmpdir());

  return {
    path,
    [Symbol.asyncDispose]: () =>
      rm(path, { recursive: true, force: true }),
  };
};

const myFunc = async () => {
  // Automatically disposed when it leaves scope!
  await using directory3 =
    await createTemporaryDirectory3();
};
