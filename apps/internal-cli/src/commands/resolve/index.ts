import type { Command } from "commander";
import { register as registerAppendVideo } from "./append-video.js";
import { register as registerCreateTimeline } from "./create-timeline.js";
import { register as registerSendClips } from "./send-clips.js";

export function register(program: Command): void {
  const resolve = program
    .command("resolve")
    .description("DaVinci Resolve operations");

  registerAppendVideo(resolve);
  registerCreateTimeline(resolve);
  registerSendClips(resolve);
}
