import {
  DAVINCI_RESOLVE_PROJECTS_LOCATION,
  EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
  EXTERNAL_DRIVE_ROOT,
  ExternalDriveNotFoundError,
  getExternalDrive,
  type AbsolutePath,
  type RelativePath,
} from "@total-typescript/shared";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const regex = /Movies(\/{0,1}).{1,}\.mp4/g;

export const clearUnusedFootageFromDisk = async () => {
  const maybeError = getExternalDrive();

  if (maybeError instanceof ExternalDriveNotFoundError) {
    console.error(
      `Could not find external drive at ${maybeError.path}. Please make sure it is connected.`,
    );
    return;
  }

  const projects = readdirSync(
    DAVINCI_RESOLVE_PROJECTS_LOCATION,
  ) as RelativePath[];

  const projectDbs = projects.map((project) => {
    return path.join(DAVINCI_RESOLVE_PROJECTS_LOCATION, project, "Project.db");
  }) as AbsolutePath[];

  const files = new Set<RelativePath>();

  for (const projectDb of projectDbs) {
    const projectDbContents = readFileSync(projectDb, "utf-8");

    const matches = projectDbContents.match(regex);

    if (!matches) {
      continue;
    }

    matches.forEach((match) => {
      files.add(match as RelativePath);
    });
  }

  const filesOnDisk = new Set(
    Array.from(files).map((file) => {
      return path.join(EXTERNAL_DRIVE_ROOT, fixMoviesPrefix(file));
    }) as AbsolutePath[],
  );

  const filesInExternalDrive = readdirSync(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT)
    .filter((file) => !file.startsWith("."))
    .filter((file) => file.endsWith(".mp4"))
    .map((file) => {
      return path.resolve(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT, file).trim();
    }) as AbsolutePath[];

  const filesToDelete = filesInExternalDrive.filter((file) => {
    return !filesOnDisk.has(file);
  });

  console.log(
    "files in external drive:",
    filesInExternalDrive.length,
    "files used:",
    filesOnDisk.size,
    "delete:",
    filesToDelete[200],
  );
};

const fixMoviesPrefix = (path: RelativePath) => {
  const regex = /Movies/g;

  return path.replace(regex, "Movies/");
};