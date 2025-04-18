import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import path from "path";
import { OBS_OUTPUT_DIRECTORY } from "./constants.js";

export const getLatestMkvFile = (dir: AbsolutePath) => {
  return execAsync(`ls -t ${path.join(dir, `*.mp4`)}`).map((r) => {
    return r.stdout.trim().split("\n")[0]!.trim() as AbsolutePath;
  });
};

export const getLatestOBSVideo = () => {
  return getLatestMkvFile(OBS_OUTPUT_DIRECTORY);
};
