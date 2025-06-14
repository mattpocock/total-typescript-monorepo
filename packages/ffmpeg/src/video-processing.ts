import { type AbsolutePath } from "@total-typescript/shared";
import {
  getFPS,
  getVideoDuration,
  encodeVideo,
  formatFloatForFFmpeg,
  trimVideo,
} from "./ffmpeg-commands.js";

export {
  getFPS,
  getVideoDuration,
  encodeVideo,
  formatFloatForFFmpeg,
  trimVideo,
};

export type VideoPosition = {
  x: number;
  y: number;
};
