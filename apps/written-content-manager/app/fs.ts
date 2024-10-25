import { ensureDir, execAsync } from "@total-typescript/shared";
import glob, { type Options } from "fast-glob";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import { access, copyFile, readFile, rm, writeFile } from "node:fs/promises";

class MyFS implements MyFS {
  readFileSync(path: string, encoding: BufferEncoding) {
    return readFileSync(path, encoding);
  }

  readFile = async (path: string, encoding: BufferEncoding) => {
    return readFile(path, encoding);
  };

  writeFile = async (path: string, data: string) => {
    return writeFile(path, data);
  };

  exists = async (path: string) => {
    return access(path).then(
      () => true,
      () => false
    );
  };

  glob = async (pattern: string[], options?: Options) => {
    return glob(pattern, options);
  };

  openInVSCode = async (path: string) => {
    (await execAsync(`code "${path}"`))._unsafeUnwrap();
  };

  rimraf = async (path: string) => {
    return rm(path, {
      recursive: true,
      force: true,
    });
  };

  ensureDir = async (path: string) => {
    await ensureDir(path);
  };

  copyFile = async (src: string, dest: string) => {
    await copyFile(src, dest);
  };
}

export const fs = new MyFS();
