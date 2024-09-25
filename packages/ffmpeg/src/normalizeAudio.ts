import { execAsync, type AbsolutePath } from "@total-typescript/shared";

export const normalizeAudio = async (
  input: AbsolutePath,
  output: AbsolutePath
) => {
  await execAsync(`ffmpeg-normalize -f ${input} -o ${output}`);
};
