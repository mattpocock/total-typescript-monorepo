import { mkdtemp, rm } from "fs/promises";
import path from "path";

export const createTmpDir = async () => {
  const tmpDir = await mkdtemp(path.join("test-"));

  return {
    dir: tmpDir,
    [Symbol.asyncDispose]: () => {
      return rm(tmpDir, { recursive: true, force: true });
    },
  };
};
