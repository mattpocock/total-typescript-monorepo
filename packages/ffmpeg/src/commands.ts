import type { AbsolutePath } from "@total-typescript/shared";
import { execSync } from "child_process";

export const encodeVideo = (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath,
) => {
  const command = `ffmpeg -y -hide_banner -i ${inputVideo} -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k ${outputVideoPath}`;

  execSync(command);
};
