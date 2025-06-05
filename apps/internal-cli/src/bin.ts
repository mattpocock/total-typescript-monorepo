#!/usr/bin/env node

import { env } from "@total-typescript/env";
import {
  createAutoEditedVideo,
  renderSubtitles,
} from "@total-typescript/ffmpeg";
import { toDashCase, type AbsolutePath } from "@total-typescript/shared";
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import readline from "readline/promises";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { commands } from "./commands.js";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import { validateWindowsFilename } from "./validateWindowsFilename.js";

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
  .command("create-auto-edited-video")
  .aliases(["v", "video"])
  .description(
    "Create a new auto-edited video from the latest OBS recording and save it to the export directory"
  )
  .option("-d, --dry-run", "Run without saving to Dropbox")
  .option("-ns, --no-subtitles", "Disable subtitle rendering")
  .action(async (options: { dryRun?: boolean; subtitles?: boolean }) => {
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
      "Enter the name for your video (without extension): "
    );

    rl.close();

    const validationResult = validateWindowsFilename(outputFilename);
    if (!validationResult.isValid) {
      console.error("Error:", validationResult.error);
      process.exit(1);
    }

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

    const transcriptPath = path.join(
      env.EXPORT_DIRECTORY_IN_UNIX,
      `${outputFilename}.a.txt`
    ) as AbsolutePath;

    await createAutoEditedVideo({
      inputVideo: latestVideo,
      outputVideo: tempOutputPath,
      transcriptPath,
    });
    console.log(`Video created successfully at: ${tempOutputPath}`);

    let finalVideoPath = tempOutputPath;

    if (options.subtitles) {
      const withSubtitlesPath = path.join(
        env.EXPORT_DIRECTORY_IN_UNIX,
        `${outputFilename}-with-subtitles.mp4`
      ) as AbsolutePath;

      await renderSubtitles(tempOutputPath, withSubtitlesPath);
      finalVideoPath = withSubtitlesPath;
    }

    if (options.dryRun) {
      console.log("Dry run mode: Skipping move to shorts directory");
      return;
    }

    // Then move to shorts directory
    const finalOutputPath = path.join(
      env.SHORTS_EXPORT_DIRECTORY,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    await fs.rename(finalVideoPath, finalOutputPath);
    console.log(`Video moved to: ${finalOutputPath}`);
  });

program.parse(process.argv);
