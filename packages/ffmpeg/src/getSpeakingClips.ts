import { Effect } from "effect";

export class CouldNotFindStartTimeError extends Error {
  readonly _tag = "CouldNotFindStartTimeError";
  override message = "Could not find video start time.";
}

export class CouldNotFindEndTimeError extends Error {
  readonly _tag = "CouldNotFindEndTimeError";
  override message = "Could not find video end time.";
}

export type GetSpeakingClipsResult = {
  startFrame: number;
  endFrame: number;
  startTime: number;
  endTime: number;
  silenceEnd: number;
  duration: number;
}[];

export const getClipsOfSpeakingFromFFmpeg = (
  stdout: string,
  opts: {
    startPadding: number;
    endPadding: number;
    fps: number;
  }
): Effect.Effect<
  GetSpeakingClipsResult,
  CouldNotFindStartTimeError | CouldNotFindEndTimeError
> => {
  // Parse the silence detection output
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

  // Group silence starts and ends together
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
    duration: number;
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
      duration: (resolvedEndFrame - resolvedStartFrame) / opts.fps,
    });
  });

  if (!clipsOfSpeaking[0]) {
    return Effect.fail(new CouldNotFindStartTimeError());
  }

  const endClip = clipsOfSpeaking[clipsOfSpeaking.length - 1];

  if (!endClip) {
    return Effect.fail(new CouldNotFindEndTimeError());
  }

  return Effect.succeed(clipsOfSpeaking);
};
