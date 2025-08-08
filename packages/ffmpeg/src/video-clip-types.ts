import type { AbsolutePath } from "@total-typescript/shared";

export type VideoClip = {
  sourceVideoPath: AbsolutePath;
  sourceVideoStartTime: number;
  sourceVideoEndTime: number;
};
