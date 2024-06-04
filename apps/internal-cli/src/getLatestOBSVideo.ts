import {
  DESKTOP_LOCATION,
  EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
  ExternalDriveNotFoundError,
  OBS_OUTPUT_MODE,
  execAsync,
  exitProcessWithError,
  getExternalDrive,
  type AbsolutePath,
} from "@total-typescript/shared";
import path from "path";

export const getLatestMp4File = async (
  dir: AbsolutePath,
): Promise<AbsolutePath> => {
  const { stdout } = await execAsync(`ls -t ${path.join(dir, "*.mp4")}`);

  const video = stdout.trim().split("\n")[0]!.trim() as AbsolutePath;

  return video;
};

export const getLatestOBSVideo = async () => {
  if (OBS_OUTPUT_MODE === "desktop") {
    const video = await getLatestMp4File(DESKTOP_LOCATION);

    return video;
  }

  const result = await getExternalDrive();

  if (result instanceof ExternalDriveNotFoundError) {
    exitProcessWithError(`External drive not found at ${result.path}`);
  }

  const video = await getLatestMp4File(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT);

  return video;
};
