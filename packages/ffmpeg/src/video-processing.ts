import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { err } from "neverthrow";

export class CouldNotGetFPSError extends Error {
  readonly _tag = "CouldNotGetFPSError";
  override message = "Could not get FPS.";
}

export const getFPS = (inputVideo: AbsolutePath) => {
  return execAsync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
  )
    .map((output) => {
      const [numerator, denominator] = output.stdout.split("/");

      return Number(numerator) / Number(denominator);
    })
    .orElse(() => {
      return err(new CouldNotGetFPSError());
    });
};

export const getVideoDuration = (inputVideo: AbsolutePath) => {
  return execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
  ).map((output) => {
    return Number(output.stdout);
  });
};

export const encodeVideo = (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`
  );
};

export const formatFloatForFFmpeg = (num: number) => {
  return num.toFixed(3);
};

export const trimVideo = (
  inputVideo: AbsolutePath,
  outputVideo: AbsolutePath,
  startTime: number,
  endTime: number
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -ss ${formatFloatForFFmpeg(
      startTime
    )} -to ${formatFloatForFFmpeg(
      endTime
    )} -i "${inputVideo}" -c copy "${outputVideo.replaceAll("\\", "")}"`
  );
};

export type VideoPosition = {
  x: number;
  y: number;
};

