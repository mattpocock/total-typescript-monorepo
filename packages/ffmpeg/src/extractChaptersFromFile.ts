import {
  execAsync,
  ExecService,
  type AbsolutePath,
} from "@total-typescript/shared";
import {
  DEFINITELY_BAD_TAKE_PADDING,
  MAX_BAD_TAKE_DISTANCE,
} from "./constants.js";
import { Effect, pipe } from "effect";

export interface RawChapter {
  id: number;
  time_base: string;
  start: number;
  start_time: string;
  end: number;
  end_time: string;
  tags: {
    title: string;
  };
}

export interface BadTakeMarker {
  frame: number;
}

export interface ChaptersResponse {
  chapters: RawChapter[];
}

export interface SpeakingClip {
  startFrame: number;
  endFrame: number;
  startTime: number;
  endTime: number;
  silenceEnd: number;
  duration: number;
}

export class CouldNotExtractChaptersError extends Error {
  readonly _tag = "CouldNotExtractChaptersError";
  override message = "Could not extract chapters from video file.";
}

export type TakeQuality = "good" | "maybe-bad" | "definitely-bad";

export const isBadTake = (
  clip: { startFrame: number; endFrame: number },
  badTakeMarkers: BadTakeMarker[],
  index: number,
  clips: { startFrame: number; endFrame: number }[],
  fps: number
): TakeQuality => {
  // Check if there's a bad take marker within the clip itself
  const hasBadTakeInClip = badTakeMarkers.some(
    (badTakeMarker) =>
      badTakeMarker.frame >= clip.startFrame &&
      badTakeMarker.frame <= clip.endFrame
  );

  if (hasBadTakeInClip) {
    return "definitely-bad";
  }

  // Check if there's a bad take marker within the padding of the end
  const paddingInFrames = Math.floor(DEFINITELY_BAD_TAKE_PADDING * fps);
  const maxDistanceInFrames = Math.floor(MAX_BAD_TAKE_DISTANCE * fps);
  const hasBadTakeNearEnd = badTakeMarkers.some(
    (badTakeMarker) =>
      badTakeMarker.frame > clip.endFrame &&
      badTakeMarker.frame <= clip.endFrame + paddingInFrames &&
      badTakeMarker.frame <= clip.endFrame + maxDistanceInFrames
  );

  if (hasBadTakeNearEnd) {
    return "definitely-bad";
  }

  // If this is the last clip, check if there's a bad take
  // marker after it
  if (index === clips.length - 1) {
    return badTakeMarkers.some(
      (badTakeMarker) =>
        badTakeMarker.frame > clip.startFrame &&
        badTakeMarker.frame <= clip.endFrame + maxDistanceInFrames
    )
      ? "maybe-bad"
      : "good";
  }

  // For all other clips, check if there's a bad take marker
  // between this clip and the next
  const nextClip = clips[index + 1]!;
  return badTakeMarkers.some(
    (badTakeMarker) =>
      badTakeMarker.frame > clip.startFrame &&
      badTakeMarker.frame < nextClip.startFrame &&
      badTakeMarker.frame <= clip.endFrame + maxDistanceInFrames
  )
    ? "maybe-bad"
    : "good";
};

export const extractBadTakeMarkersFromFile = (
  inputVideo: AbsolutePath,
  fps: number
): Effect.Effect<
  BadTakeMarker[],
  CouldNotExtractChaptersError,
  ExecService
> => {
  return pipe(
    execAsync(
      `ffprobe -i "${inputVideo}" -show_chapters -v quiet -print_format json`
    ),
    Effect.map(({ stdout }) => {
      const response = JSON.parse(stdout.trim()) as ChaptersResponse;
      return response.chapters
        .filter((chapter) => chapter.tags.title === "Bad Take")
        .map((chapter) => ({
          ...chapter,
          frame: Math.floor((chapter.start / 1000) * fps),
        }));
    }),
    Effect.catchAll(() => Effect.fail(new CouldNotExtractChaptersError()))
  );
};
