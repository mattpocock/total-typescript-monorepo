import { env } from "@total-typescript/env";
import {
  ExternalDriveNotFoundError,
  pathExists,
  type AbsolutePath,
} from "@total-typescript/shared";
import path from "path";

export const EXTERNAL_DRIVE_ROOT = env.EXTERNAL_DRIVE_ROOT as AbsolutePath;

export const getExternalDrive = async () => {
  if (!(await pathExists(EXTERNAL_DRIVE_ROOT))) {
    return new ExternalDriveNotFoundError(EXTERNAL_DRIVE_ROOT);
  }

  return EXTERNAL_DRIVE_ROOT;
};

export const EXTERNAL_DRIVE_MOVIES_ROOT = path.join(
  EXTERNAL_DRIVE_ROOT,
  "Movies",
) as AbsolutePath;

export const DAVINCI_RESOLVE_EXPORTS_LOCATION = path.join(
  EXTERNAL_DRIVE_ROOT,
  "Exports",
) as AbsolutePath;

export const EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT = path.join(
  EXTERNAL_DRIVE_MOVIES_ROOT,
  "obs-output",
) as AbsolutePath;

/**
 * Places where unencoded footage might be located.
 */
export const POSSIBLE_UNENCODED_FOLDER_LOCATIONS = [
  path.join(EXTERNAL_DRIVE_MOVIES_ROOT, "total-typescript"),
  path.join(EXTERNAL_DRIVE_MOVIES_ROOT, "matt"),
  path.join(EXTERNAL_DRIVE_MOVIES_ROOT, "one-shots"),
] as AbsolutePath[];
