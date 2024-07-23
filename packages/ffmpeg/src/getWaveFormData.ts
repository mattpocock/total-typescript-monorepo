import { execAsync, type AbsolutePath } from "@total-typescript/shared";

export const getWaveFormData = async (
  inputVideo: AbsolutePath,
): Promise<number[]> => {
  const output = await execAsync(
    `ffprobe -v error -f lavfi -i "amovie=${inputVideo},astats=metadata=1:reset=1" -show_entries frame_tags=lavfi.astats.Overall.RMS_level -of csv=p=0`,
  );

  const amplitudes = output.stdout
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
