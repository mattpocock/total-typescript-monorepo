import { exec, type AbsolutePath } from "@total-typescript/shared";

export const encodeVideo = async (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath,
) => {
  await exec`ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`;
};
