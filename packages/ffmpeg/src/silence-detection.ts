import { type AbsolutePath } from "@total-typescript/shared";
import { Data, Effect } from "effect";
import { MINIMUM_CLIP_LENGTH_IN_SECONDS } from "./constants.js";
import { FFmpegCommandsService } from "./services.js";

export const CouldNotFindStartTimeError = Data.TaggedError(
  "CouldNotFindStartTimeError"
);

export const CouldNotFindEndTimeError = Data.TaggedError(
  "CouldNotFindEndTimeError"
);

export const getClipsOfSpeakingFromFFmpeg = (
  stdout: string,
  opts: {
    startPadding: number;
    endPadding: number;
    fps: number;
  }
) => {
  const silenceLines = stdout
    .trim()
    .split("\n")
    .filter((line) => line.includes("[silencedetect @"))
    .map((line) => {
      if (line.includes("silence_start")) {
        const match = line.match(/silence_start: (\d+\.?\d*)/);
        return {
          type: "start" as const,
          time: match ? Number(match[1]) : undefined,
        };
      }
      if (line.includes("silence_end")) {
        const match = line.match(
          /silence_end: (\d+\.?\d*) \| silence_duration: (\d+\.?\d*)/
        );
        return {
          type: "end" as const,
          time: match ? Number(match[1]) : undefined,
          duration: match ? Number(match[2]) : undefined,
        };
      }
      return null;
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const silence: { silenceEnd: number; duration: number }[] = [];
  let currentStart: number | undefined;

  for (const line of silenceLines) {
    if (line.type === "start") {
      currentStart = line.time;
    } else if (line.type === "end" && currentStart !== undefined) {
      silence.push({
        silenceEnd: line.time!,
        duration: line.duration!,
      });
      currentStart = undefined;
    }
  }

  const clipsOfSpeaking: {
    startFrame: number;
    endFrame: number;
    startTime: number;
    endTime: number;
    silenceEnd: number;
    durationInFrames: number;
  }[] = [];

  silence.forEach((currentSilence) => {
    const nextSilence = silence[silence.indexOf(currentSilence) + 1];

    if (!nextSilence) return;

    const startTime = currentSilence.silenceEnd;
    const endTime = nextSilence.silenceEnd - nextSilence.duration;

    const startFrame = Math.floor(startTime * opts.fps);
    const endFrame = Math.ceil(endTime * opts.fps);

    if (startFrame === endFrame) return;

    const startFramePadding = opts.startPadding * opts.fps;
    const endFramePadding = opts.endPadding * opts.fps;

    const resolvedStartFrame = startFrame - startFramePadding;
    const resolvedEndFrame = endFrame + endFramePadding;

    clipsOfSpeaking.push({
      startFrame: resolvedStartFrame,
      endFrame: resolvedEndFrame,
      startTime: resolvedStartFrame / opts.fps,
      endTime: resolvedEndFrame / opts.fps,
      silenceEnd: currentSilence.silenceEnd,
      durationInFrames: resolvedEndFrame - resolvedStartFrame,
    });
  });

  return clipsOfSpeaking;
};

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
  return Effect.gen(function* () {
    const ffmpeg = yield* FFmpegCommandsService;

    const processStartTime = Date.now();
    console.log("🎥 Processing video:", inputVideo);

    console.log("🔍 Finding speaking clips...");

    const speakingStart = Date.now();
    const { stdout } = yield* ffmpeg.detectSilence(
      inputVideo,
      opts.threshold,
      opts.silenceDuration
    );

    const speakingClips = getClipsOfSpeakingFromFFmpeg(stdout, opts);
    console.log(
      `✅ Found ${speakingClips.length} speaking clips (took ${(Date.now() - speakingStart) / 1000}s)`
    );

    if (!speakingClips[0]) {
      return yield* Effect.fail(new CouldNotFindStartTimeError(void 0));
    }

    const endClip = speakingClips[speakingClips.length - 1];

    if (!endClip) {
      return yield* Effect.fail(new CouldNotFindEndTimeError(void 0));
    }

    const clipStartTime = speakingClips[0].startTime;
    const endTime = endClip.endTime;

    console.log("🔍 Filtering clips...");
    const filterStart = Date.now();

    const filteredClips = speakingClips.filter(
      (clip) =>
        clip.durationInFrames > MINIMUM_CLIP_LENGTH_IN_SECONDS * opts.fps
    );

    console.log(
      `✅ Filtered to ${filteredClips.length} clips (took ${(Date.now() - filterStart) / 1000}s)`
    );

    const totalTime = (Date.now() - processStartTime) / 1000;
    console.log(`✅ Successfully processed video! (Total time: ${totalTime}s)`);

    return {
      speakingClips: filteredClips,
      startTime: clipStartTime,
      endTime,
      rawStdout: stdout,
    };
  });
};
