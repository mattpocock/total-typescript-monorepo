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
    .orElse((e) => {
      return err(new CouldNotGetFPSError());
    });
};
