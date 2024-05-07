import path from "path";
import os from "os";
import type { AbsolutePath } from "./types.js";

export const EXTERNAL_DRIVE_ROOT = path.join("/Volumes", "T7\\ Shield");

export const EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT = path.join(
  EXTERNAL_DRIVE_ROOT,
  "Movies",
);

export const EXTERNAL_DRIVE_TRIMMED_FOOTAGE_ROOT = path.join(
  EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
  "total-typescript",
);

export const SCRIPTKIT_VSCODE_LOCATION = path.join(
  os.homedir(),
  ".kit",
  "db",
  "vscode.json",
) as AbsolutePath;

export const SCRIPTKIT_LOCATION = path.join(os.homedir(), ".kenv");

export const SCRIPTKIT_SCRIPTS_LOCATION = path.join(
  SCRIPTKIT_LOCATION,
  "scripts",
);

export const POSSIBLE_UNENCODED_FOLDER_LOCATIONS = [
  EXTERNAL_DRIVE_TRIMMED_FOOTAGE_ROOT,
  path.join(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT, "matt"),
  path.join(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT, "one-shots"),
] as AbsolutePath[];
