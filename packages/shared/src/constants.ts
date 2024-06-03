import path from "path";
import os from "os";
import type { AbsolutePath } from "./types.js";

export const EXTERNAL_DRIVE_ROOT = path.join(
  "/Volumes",
  "t7-shield",
) as AbsolutePath;

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

export const DESKTOP_LOCATION = path.join(
  os.homedir(),
  "Desktop",
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
  path.join(EXTERNAL_DRIVE_MOVIES_ROOT, "total-typescript"),
  path.join(EXTERNAL_DRIVE_MOVIES_ROOT, "matt"),
  path.join(EXTERNAL_DRIVE_MOVIES_ROOT, "one-shots"),
] as AbsolutePath[];

export const REPOS_FOLDER = path.join(os.homedir(), "repos") as AbsolutePath;

export const DAVINCI_RESOLVE_SCRIPTS_LOCATION = path.resolve(
  import.meta.dirname ?? "", // Added as a hack for now
  "..",
  "..",
  "resolve-scripts",
  "scripts",
);

export const SKILL_RECORDINGS_REPO_LOCATION = path.join(
  REPOS_FOLDER,
  "ts",
  "products",
) as AbsolutePath;

export const DAVINCI_RESOLVE_PROJECTS_LOCATION = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Blackmagic Design",
  "DaVinci Resolve",
  "Resolve Project Library",
  "Resolve Projects",
  "Users",
  "guest",
  "Projects",
) as AbsolutePath;

type OBSOutputMode = "external-drive" | "desktop";

export const OBS_OUTPUT_MODE: OBSOutputMode = "external-drive";
