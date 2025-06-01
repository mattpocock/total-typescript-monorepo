import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { err, ok, safeTry } from "neverthrow";
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
  return safeTry(async function* () {
    const processStartTime = Date.now();
    console.log("🎥 Processing video:", inputVideo);

    // First, find all speaking clips
    console.log("🔍 Finding speaking clips...");
    const speakingStart = Date.now();
    const { stdout } = yield* execAsync(
      `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${opts.threshold}dB:d=${opts.silenceDuration}" -f null - 2>&1`
    );

    const speakingClips = getClipsOfSpeakingFromFFmpeg(stdout, opts);
    console.log(
      `✅ Found ${speakingClips.length} speaking clips (took ${(Date.now() - speakingStart) / 1000}s)`
    );

    if (!speakingClips[0]) {
      return err(new CouldNotFindStartTimeError());
    }

    const endClip = speakingClips[speakingClips.length - 1];

    if (!endClip) {
      return err(new CouldNotFindEndTimeError());
    }

    const clipStartTime = speakingClips[0].startTime;
    const endTime = endClip.endTime;

    // Filter out clips that are too short
    console.log("🔍 Filtering clips...");
    const filterStart = Date.now();

    const filteredClips = speakingClips.filter(
      (clip) => clip.duration > MINIMUM_CLIP_LENGTH_IN_SECONDS
    );

    console.log(
      `✅ Filtered to ${filteredClips.length} clips (took ${(Date.now() - filterStart) / 1000}s)`
    );

    const totalTime = (Date.now() - processStartTime) / 1000;
    console.log(`✅ Successfully processed video! (Total time: ${totalTime}s)`);

    return ok({
      speakingClips: filteredClips,
      startTime: clipStartTime,
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
