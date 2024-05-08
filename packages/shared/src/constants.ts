import path from "path";
import os from "os";
import type { AbsolutePath } from "./types.js";

export const EXTERNAL_DRIVE_ROOT = path.join(
  "/Volumes",
  "T7\\ Shield",
) as AbsolutePath;

export const EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT = path.join(
  EXTERNAL_DRIVE_ROOT,
  "Movies",
) as AbsolutePath;

export const SCRIPTKIT_VSCODE_LOCATION = path.join(
  os.homedir(),
  ".kit",
  "db",
  "vscode.json",
) as AbsolutePath;

export const SCRIPTKIT_LOCATION = path.join(
  os.homedir(),
  ".kenv",
) as AbsolutePath;

export const SCRIPTKIT_SCRIPTS_LOCATION = path.join(
  SCRIPTKIT_LOCATION,
  "scripts",
) as AbsolutePath;

/**
 * Places where unencoded footage might be located.
 */
export const POSSIBLE_UNENCODED_FOLDER_LOCATIONS = [
  path.join(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT, "total-typescript"),
  path.join(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT, "matt"),
  path.join(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT, "one-shots"),
] as AbsolutePath[];

export const REPOS_FOLDER = path.join(os.homedir(), "repos") as AbsolutePath;

export const DAVINCI_RESOLVE_SCRIPTS_LOCATION = path.join(
  REPOS_FOLDER,
  "ts",
  "total-typescript-monorepo",
  "packages",
  "resolve-scripts",
  "scripts",
);
