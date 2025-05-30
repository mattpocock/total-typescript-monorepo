#!/usr/bin/env node

import { Command } from "commander";
import { commands } from "./commands.js";
import { toDashCase, type AbsolutePath } from "@total-typescript/shared";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { createSpeakingOnlyVideo } from "@total-typescript/ffmpeg";
import path from "path";

const program = new Command();

program.version(packageJson.version);

commands.forEach((command) => {
  let cliCommand = command.cliCommand;

  if (command.args) {
    cliCommand += ` ${command.args
      .map((arg) => {
        return `<${toDashCase(arg)}>`;
      })
      .join(" ")}`;
  }

  program
    .command(cliCommand)
    .action(command.run)
    .description(command.description);
});

program
  .command("append-video-to-timeline [video]")
  .aliases(["a", "append"])
  .description("Append video to the current timeline")
  .action(async (video: string | undefined) => {
    await appendVideoToTimeline(video);
  });

program
  .command("create-speaking-only-video <input> <output>")
  .aliases(["s", "speaking"])
  .description("Create a new video containing only the good speaking parts")
  .action(async (input: string, output: string) => {
    await createSpeakingOnlyVideo(
      path.resolve(input) as AbsolutePath,
      path.resolve(output) as AbsolutePath
    );
  });

program.parse(process.argv);
