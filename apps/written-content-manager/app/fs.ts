import { ensureDir, execAsync } from "@total-typescript/shared";
import glob, { type Options } from "fast-glob";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFileSync } from "node:fs";
import { access, copyFile, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface MyFS {
  readFileSync: (path: string, encoding: BufferEncoding) => string;
  readFile: (path: string, encoding: BufferEncoding) => Promise<string>;
  writeFile: (path: string, data: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  glob: (pattern: string[], options?: Options) => Promise<string[]>;
  openInVSCode: (path: string) => Promise<void>;
  rimraf: (path: string) => Promise<void>;
  ensureDir: (path: string) => Promise<void>;
  copyFile: (src: string, dest: string) => Promise<void>;
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

  ensureDir = async (path: string) => {
    // Add every directory in the path to the file map
    const parts = path.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const dir = parts.slice(0, i).join("/");
      if (!this.fileMap.has(dir)) {
        this.fileMap.set(dir, "");
      }
    }
  };

  exists = async (path: string) => {
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

  rimraf = async (path: string) => {
    this.fileMap.delete(path);
  };

  copyFile = async (src: string, dest: string) => {
    const file = this.fileMap.get(src);

    if (typeof file === "undefined") {
      throw new Error(`File not found: ${src}`);
    }

    this.fileMap.set(dest, file);
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
