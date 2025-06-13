import {
  execAsync,
  ExecService,
  type AbsolutePath,
} from "@total-typescript/shared";
import { Effect, pipe } from "effect";

export class CouldNotGetFPSError extends Error {
  readonly _tag = "CouldNotGetFPSError";
  override message = "Could not get FPS.";
}

export const getFPS = (inputVideo: AbsolutePath) => {
  return pipe(
    execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
    ),
    Effect.map((output) => {
      const [numerator, denominator] = output.stdout.split("/");

      return Number(numerator) / Number(denominator);
    }),
    Effect.catchAll((e) => {
      return Effect.fail(new CouldNotGetFPSError());
    })
  );
};
