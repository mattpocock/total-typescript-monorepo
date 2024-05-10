import type { AbsolutePath } from "@total-typescript/shared";
import { execSync } from "child_process";

export const getFPS = (inputVideo: AbsolutePath) => {
  const output = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`,
  ).toString();

  const [numerator, denominator] = output.split("/");

  return Number(numerator) / Number(denominator);
};
