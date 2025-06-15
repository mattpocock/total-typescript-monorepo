import type { FFMPeg } from "./ffmpeg-commands.js";

export type Context = {
  ffmpeg: FFMPeg;
  fs: typeof import("fs/promises");
  transcriptionDirectory: string;
};
