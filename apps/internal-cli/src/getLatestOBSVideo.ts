import {
  EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
  ExternalDriveNotFoundError,
  execAsync,
  exitProcessWithError,
  getExternalDrive,
  type AbsolutePath,
} from "@total-typescript/shared";
import { execSync } from "child_process";
import path from "path";

export const getLatestOBSVideo = async () => {
  const result = await getExternalDrive();

  if (result instanceof ExternalDriveNotFoundError) {
    exitProcessWithError(`External drive not found at ${result.path}`);
  }

  // Doesn't work with execa for some reason
  const { stdout } = await execAsync(
    `ls -t ${path.join(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT, "*.mp4")}`,
  );

  const video = stdout.trim().split("\n")[0]!.trim() as AbsolutePath;

  return video;
};
