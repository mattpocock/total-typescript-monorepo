import type { Command } from "commander";
import { register as registerDetect } from "./detect.js";
import { register as registerTranscribe } from "./transcribe.js";

export function register(program: Command): void {
  const clips = program.command("clips").description("Clip operations");

  registerDetect(clips);
  registerTranscribe(clips);
}
