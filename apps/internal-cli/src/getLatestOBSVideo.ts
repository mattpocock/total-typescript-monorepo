import { env } from "@total-typescript/env";
import {
  DESKTOP_LOCATION,
  execAsync,
  type AbsolutePath,
} from "@total-typescript/shared";
import path from "path";
import { EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT } from "./constants.js";

export const getLatestMp4File = (dir: AbsolutePath) => {
  return execAsync(`ls -t ${path.join(dir, "*.mp4")}`).map((r) => {
    return r.stdout.trim().split("\n")[0]!.trim() as AbsolutePath;
  });
};

export const getLatestOBSVideo = () => {
  if (env.OBS_OUTPUT_MODE === "desktop") {
    return getLatestMp4File(DESKTOP_LOCATION);
  }

  return getLatestMp4File(EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT);
};
