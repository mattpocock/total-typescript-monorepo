import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { ResultAsync } from "neverthrow";

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

export interface BadTakeMarker extends RawChapter {
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

export const isBadTake = (
  clip: SpeakingClip,
  badTakeMarkers: BadTakeMarker[],
  index: number,
  clips: SpeakingClip[]
): boolean => {
  // If this is the last clip, check if there's a bad take
  // marker after it
  if (index === clips.length - 1) {
    return badTakeMarkers.some(
      (badTakeMarker) => badTakeMarker.frame > clip.startFrame
    );
  }

  // For all other clips, check if there's a bad take marker
  // between this clip and the next
  const nextClip = clips[index + 1]!;
  return badTakeMarkers.some(
    (badTakeMarker) =>
      badTakeMarker.frame > clip.startFrame &&
      badTakeMarker.frame < nextClip.startFrame
  );
};

export const extractBadTakeMarkersFromFile = (
  inputVideo: AbsolutePath,
  fps: number
): ResultAsync<BadTakeMarker[], CouldNotExtractChaptersError> => {
  return execAsync(
    `ffprobe -i "${inputVideo}" -show_chapters -v quiet -print_format json`
  )
    .map(({ stdout }) => {
      const response = JSON.parse(stdout.trim()) as ChaptersResponse;
      return response.chapters
        .filter((chapter) => chapter.tags.title === "Bad Take")
        .map((chapter) => ({
          ...chapter,
          frame: Math.floor((chapter.start / 1000) * fps),
        }));
    })
    .mapErr(() => new CouldNotExtractChaptersError());
};
