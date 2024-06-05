import { exec, type ExecOptions } from "child_process";
import { stat } from "fs/promises";
import type { AbsolutePath } from "./types.js";

export const pathExists = async (path: string): Promise<boolean> => {
  try {
    await stat(path);
    return true;
  } catch (e) {
    return false;
  }
};

export const execAsync = async (command: string, opts?: ExecOptions) => {
  return new Promise<{
    stdout: string;
    stderr: string;
  }>((resolve, reject) => {
    exec(command, opts, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }

      resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
    });
  });
};

export const revealInFileExplorer = async (file: AbsolutePath) => {
  if (process.platform === "win32") {
    await execAsync(`explorer /select,${file}`);
  } else if (process.platform === "darwin") {
    await execAsync(`open -R "${file}"`);
  }
};

export const exitProcessWithError = (message: string) => {
  console.error(message);
  process.exit(1);
};

export class ExternalDriveNotFoundError {
  readonly name = "ExternalDriveNotFoundError";

  constructor(public path: string) {}
}

export const toDashCase = (str: string) => {
  return str.replaceAll(" ", "-").toLowerCase();
};
