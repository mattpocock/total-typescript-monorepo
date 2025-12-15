import type { AbsolutePath } from "@total-typescript/shared";

export type VideoClip = {
  sourceVideoPath: AbsolutePath;
  sourceVideoStartTime: number;
  sourceVideoEndTime: number;
};

/**
 * The type of beat that should be appended to the clip.
 *
 * Long beats are a little longer, 'none' means no beat should be appended.
 */
export type BeatType = "none" | "long";

export type ClipWithMetadata = {
  startTime: number;
  duration: number;
  inputVideo: AbsolutePath;
  beatType: BeatType;
};
