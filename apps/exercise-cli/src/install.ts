import {
  type ExecSyncOptionsWithBufferEncoding,
  execSync,
} from "child_process";
import { existsSync } from "fs";

const lockfiles = {
  pnpm: "pnpm-lock.yaml",
  npm: "package-lock.json",
};

export const npm = (cmd: string, opts?: ExecSyncOptionsWithBufferEncoding) => {
  if (existsSync(lockfiles.pnpm)) {
    return execSync(`pnpm ${cmd}`, opts);
  }

  if (existsSync(lockfiles.npm)) {
    return execSync(`npm ${cmd}`, opts);
  }

  throw new Error("Could not find a lockfile.");
};

export const npx = (cmd: string, opts?: ExecSyncOptionsWithBufferEncoding) => {
  return execSync(`npx ${cmd}`, opts);

  // throw new Error("Could not find a lockfile.");
};
