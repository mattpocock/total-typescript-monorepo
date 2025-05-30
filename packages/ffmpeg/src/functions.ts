import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { err, ok } from "neverthrow";
import { MINIMUM_CLIP_LENGTH_IN_SECONDS } from "./constants.js";
import { getClipsOfSpeakingFromFFmpeg } from "./getSpeakingClips.js";

export const encodeVideo = (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`
  );
};

export class CouldNotFindStartTimeError extends Error {
  readonly _tag = "CouldNotFindStartTimeError";
  override message = "Could not find video start time.";
}

export class CouldNotFindEndTimeError extends Error {
  readonly _tag = "CouldNotFindEndTimeError";
  override message = "Could not find video end time.";
}

export const findSilenceInVideo = (
  inputVideo: AbsolutePath,
  opts: {
    threshold: number | string;
    silenceDuration: number | string;
    startPadding: number;
    endPadding: number;
    fps: number;
  }
) => {
  return execAsync(
    `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${opts.threshold}dB:d=${opts.silenceDuration}" -f null - 2>&1`
  )
    .map(({ stdout }) => {
      return {
        speakingClips: getClipsOfSpeakingFromFFmpeg(stdout, opts),
        stdout,
      };
    })
    .andThen((input) => {
      const { speakingClips, stdout } = input;
      if (!speakingClips[0]) {
        return err(new CouldNotFindStartTimeError());
      }
      const endClip = speakingClips[speakingClips.length - 1];

      if (!endClip) {
        return err(new CouldNotFindEndTimeError());
      }
      const startTime = speakingClips[0].startTime;
      const endTime = endClip.endTime;

      return ok({
        speakingClips: speakingClips.filter(
          (clip) => clip.duration > MINIMUM_CLIP_LENGTH_IN_SECONDS
        ),
        startTime,
        endTime,
        rawStdout: stdout,
      });
    });
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
