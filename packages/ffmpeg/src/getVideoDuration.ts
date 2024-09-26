import { execAsync, type AbsolutePath } from "@total-typescript/shared";

export const getVideoDuration = (inputVideo: AbsolutePath) => {
  return execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
  ).map((output) => {
    return Number(output.stdout);
  });
};
