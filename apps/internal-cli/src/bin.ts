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
import readline from "readline/promises";
import fs from "fs/promises";

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
  .command("create-short")
  .aliases(["s", "short"])
  .description(
    "Create a new short video from the latest OBS recording and save it to the shorts export directory"
  )
  .action(async () => {
    const latestVideoResult = await getLatestOBSVideo();
    if (latestVideoResult.isErr()) {
      console.error("Failed to get latest OBS video:", latestVideoResult.error);
      process.exit(1);
    }

    const latestVideo = latestVideoResult.value;

    // Prompt for the output filename
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const outputFilename = await rl.question(
      "Enter the name for your short (without extension): "
    );

    // Ensure the readline interface is closed
    // when the process exits
    process.on("beforeExit", () => {
      rl.close();
    });

    // First create in the export directory
    const tempOutputPath = path.join(
      env.EXPORT_DIRECTORY_IN_UNIX,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    await createSpeakingOnlyVideo(latestVideo, tempOutputPath);
    console.log(`Video created successfully at: ${tempOutputPath}`);

    // Then move to shorts directory
    const finalOutputPath = path.join(
      env.SHORTS_EXPORT_DIRECTORY,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    await fs.rename(tempOutputPath, finalOutputPath);
    console.log(`Short moved to: ${finalOutputPath}`);

    rl.close();
  });

program.parse(process.argv);
