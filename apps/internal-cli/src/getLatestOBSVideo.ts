import {
  EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
  ExternalDriveNotFoundError,
  exitProcessWithError,
  getExternalDrive,
  type AbsolutePath,
} from "@total-typescript/shared";
import { execSync } from "child_process";
import path from "path";

export const getLatestMp4File = async (
  dir: AbsolutePath,
): Promise<AbsolutePath> => {
  const stdout = execSync(`ls -t ${path.join(dir, "*.mp4")}`).toString();

  const video = stdout.trim().split("\n")[0]!.trim() as AbsolutePath;

  return video;
};

export const getLatestOBSVideo = async () => {
  const result = await getExternalDrive();

  if (result instanceof ExternalDriveNotFoundError) {
    exitProcessWithError(`External drive not found at ${result.path}`);
  }

  const video = await getLatestMp4File(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT);

  return video;
};
