import type { AbsolutePath } from "@total-typescript/shared";
import { execSync } from "child_process";

export const getWaveFormData = async (
  inputVideo: AbsolutePath,
): Promise<number[]> => {
  const output = execSync(
    `ffprobe -v error -f lavfi -i "amovie=${inputVideo},astats=metadata=1:reset=1" -show_entries frame_tags=lavfi.astats.Overall.RMS_level -of csv=p=0`,
  ).toString();

  const amplitudes = output
    .trim()
    .split("\n")
    .map((line, index, arr) => {
      const float = parseFloat(line);

      if (Number.isNaN(float)) {
        const resolvedString = arr[index - 1] || arr[index + 1] || "-122";

        return parseFloat(resolvedString);
      }
      return float;
    });

  return amplitudes;
};
