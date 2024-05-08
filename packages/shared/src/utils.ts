import { execSync } from "child_process";
import { pathExists } from "fs-extra/esm";
import {
  EXTERNAL_DRIVE_ROOT,
  EXTERNAL_DRIVE_ROOT_WITHOUT_ESCAPES,
} from "./constants.js";
import type { AbsolutePath } from "./types.js";

export const revealInFileExplorer = async (file: AbsolutePath) => {
  if (process.platform === "win32") {
    await execSync(`explorer /select,${file}`);
  } else if (process.platform === "darwin") {
    await execSync(`open -R "${file}"`);
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

export const getExternalDrive = async () => {
  if (!(await pathExists(EXTERNAL_DRIVE_ROOT_WITHOUT_ESCAPES))) {
    return new ExternalDriveNotFoundError(EXTERNAL_DRIVE_ROOT_WITHOUT_ESCAPES);
  }

  return EXTERNAL_DRIVE_ROOT;
};
