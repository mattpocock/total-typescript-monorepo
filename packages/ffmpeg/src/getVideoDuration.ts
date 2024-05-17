import { execAsync, type AbsolutePath } from "@total-typescript/shared";

export const getVideoDuration = async (inputVideo: AbsolutePath) => {
  const output = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`,
  );

  return Number(output.stdout);
};
