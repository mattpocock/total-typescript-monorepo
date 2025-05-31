#!/usr/bin/env node

import { Command } from "commander";
import { commands } from "./commands.js";
import { toDashCase, type AbsolutePath } from "@total-typescript/shared";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { createSpeakingOnlyVideo } from "@total-typescript/ffmpeg";
import path from "path";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import { env } from "@total-typescript/env";

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
  .command("create-speaking-only-video")
  .aliases(["s", "speaking"])
  .description(
    "Create a new video containing only the good speaking parts from the latest OBS recording"
  )
  .action(async () => {
    const latestVideoResult = await getLatestOBSVideo();
    if (latestVideoResult.isErr()) {
      console.error("Failed to get latest OBS video:", latestVideoResult.error);
      process.exit(1);
    }

    const latestVideo = latestVideoResult.value;
    const outputFilename = `auto-edit-${path.basename(latestVideo)}`;
    const outputPath = path.join(
      env.EXPORT_DIRECTORY_IN_UNIX,
      outputFilename
    ) as AbsolutePath;

    await createSpeakingOnlyVideo(latestVideo, outputPath);
  });

program.parse(process.argv);
