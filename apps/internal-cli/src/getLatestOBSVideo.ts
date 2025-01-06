import { env } from "@total-typescript/env";
import {
  DESKTOP_LOCATION,
  execAsync,
  type AbsolutePath,
} from "@total-typescript/shared";
import path from "path";
import { OBS_OUTPUT_DIRECTORY } from "./constants.js";

export const getLatestMp4File = (dir: AbsolutePath) => {
  return execAsync(`ls -t ${path.join(dir, "*.mp4")}`).map((r) => {
    return r.stdout.trim().split("\n")[0]!.trim() as AbsolutePath;
  });
};

export const getLatestOBSVideo = () => {
  return getLatestMp4File(OBS_OUTPUT_DIRECTORY);
};
