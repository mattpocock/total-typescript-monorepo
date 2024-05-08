import { pathExists } from "fs-extra/esm";
import { exec } from "./exec.js";
import type { AbsolutePath } from "./types.js";
import {} from "fs-extra/esm";
import { EXTERNAL_DRIVE_ROOT } from "./constants.js";

export const revealInFileExplorer = async (file: AbsolutePath) => {
  if (process.platform === "win32") {
    await exec`explorer /select,${file}`;
  } else if (process.platform === "darwin") {
    await exec`open -R ${file}`;
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

export const getExternalDrive = async (): Promise<
  AbsolutePath | ExternalDriveNotFoundError
> => {
  if (!(await pathExists(EXTERNAL_DRIVE_ROOT))) {
    return new ExternalDriveNotFoundError(EXTERNAL_DRIVE_ROOT);
  }

  return EXTERNAL_DRIVE_ROOT;
};
