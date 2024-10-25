import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export const createTmpDir = async () => {
  const tmpDir = await mkdtemp(path.join(tmpdir(), "test-"));

  return {
    dir: tmpDir,
    [Symbol.asyncDispose]: async () => {
      await rm(tmpDir, { recursive: true, force: true });
    },
  };
};
