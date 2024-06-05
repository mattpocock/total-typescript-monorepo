import path from "path";
import os from "os";
import type { AbsolutePath } from "./types.js";

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
