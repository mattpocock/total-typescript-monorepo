import { ensureDir, execAsync } from "@total-typescript/shared";
import glob, { type Options } from "fast-glob";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface MyFS {
  readFileSync: (path: string, encoding: BufferEncoding) => string;
  readFile: (path: string, encoding: BufferEncoding) => Promise<string>;
  writeFile: (path: string, data: string) => Promise<void>;
  access: (path: string) => Promise<boolean>;
  glob: (pattern: string[], options?: Options) => Promise<string[]>;
  openInVSCode: (path: string) => Promise<void>;
}

export class FileSystemFS implements MyFS {
  constructor() {
    if (process.env.NODE_ENV === "test") {
      throw new Error("FileSystemFS should not be used in tests");
    }
  }
  readFileSync(path: string, encoding: BufferEncoding) {
    return readFileSync(path, encoding);
  }

  readFile = async (path: string, encoding: BufferEncoding) => {
    return readFile(path, encoding);
  };

  writeFile = async (path: string, data: string) => {
    await ensureDir(path);
    return writeFile(path, data);
  };

  access = async (path: string) => {
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
}

export class LocalFS implements MyFS {
  private fileMap: Map<string, string> = new Map();
  private filesOpenedInVSCode: Map<string, number> = new Map();

  readFileSync(path: string, encoding: BufferEncoding) {
    const file = this.fileMap.get(path);

    if (typeof file === "undefined") {
      throw new Error(`File not found: ${path}`);
    }

    return file;
  }

  readFile = async (path: string, encoding: BufferEncoding) => {
    return this.readFileSync(path, encoding);
  };

  writeFile = async (path: string, data: string) => {
    this.fileMap.set(path, data);
  };

  ensureDir = async (path: string) => {};

  access = async (path: string) => {
    return this.fileMap.has(path);
  };

  glob = async (patterns: string[], options?: Options) => {
    return Array.from(this.fileMap.keys()).filter((key) =>
      patterns.some((pattern) => {
        const patternWithCwd = path.join(options?.cwd ?? "", pattern);
        return path.matchesGlob(key, patternWithCwd);
      })
    );
  };

  openInVSCode = async (path: string) => {
    const count = this.filesOpenedInVSCode.get(path) ?? 0;
    this.filesOpenedInVSCode.set(path, count + 1);
  };

  countOpensInVSCode = (path: string): number => {
    return this.filesOpenedInVSCode.get(path) ?? 0;
  };

  rm = async (path: string) => {
    this.fileMap.delete(path);
  };
}

export const fsStorage = new AsyncLocalStorage<MyFS>();

const localFSSingleton = new LocalFS();

export const getFS = () =>
  fsStorage.getStore() ??
  (process.env.NODE_ENV === "test" ? localFSSingleton : new FileSystemFS());

export const mockFS = async (test: (fs: LocalFS) => Promise<void>) => {
  const myFS = new LocalFS();

  await fsStorage.run(myFS, async () => {
    await test(myFS);
  });
};
