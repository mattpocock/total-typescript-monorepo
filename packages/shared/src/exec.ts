import {
  execSync,
  type ExecSyncOptionsWithBufferEncoding,
} from "child_process";

export const exec = async (
  command: string,
  opts?: ExecSyncOptionsWithBufferEncoding,
) => {
  return execSync(command, {
    stdio: "inherit",
    ...opts,
  });
};
