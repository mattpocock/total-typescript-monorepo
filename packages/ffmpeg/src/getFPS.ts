import { execAsync, type AbsolutePath } from "@total-typescript/shared";

export const getFPS = async (inputVideo: AbsolutePath) => {
  const output = await execAsync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`,
  );

  const [numerator, denominator] = output.stdout.split("/");

  return Number(numerator) / Number(denominator);
};
