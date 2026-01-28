import type { Command } from "commander";
import { register as registerConcat } from "./concat.js";
import { register as registerFromClips } from "./from-clips.js";
import { register as registerProcess } from "./process.js";
import { register as registerRetry } from "./retry.js";
import { register as registerStatus } from "./status.js";

export function register(program: Command): void {
  const queue = program
    .command("queue")
    .description("Queue management operations");

  registerConcat(queue);
  registerFromClips(queue);
  registerProcess(queue);
  registerRetry(queue);
  registerStatus(queue);
}
