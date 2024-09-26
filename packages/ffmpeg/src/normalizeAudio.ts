import { execAsync, type AbsolutePath } from "@total-typescript/shared";

export const normalizeAudio = (input: AbsolutePath, output: AbsolutePath) => {
  return execAsync(`ffmpeg-normalize -f ${input} -o ${output}`);
};
