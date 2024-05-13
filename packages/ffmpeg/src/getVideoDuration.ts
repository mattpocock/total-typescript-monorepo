import type { AbsolutePath } from "@total-typescript/shared";
import { execSync } from "child_process";

export const getVideoDuration = (inputVideo: AbsolutePath) => {
  const output = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`,
  ).toString();

  return Number(output);
};
