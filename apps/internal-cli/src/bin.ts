#!/usr/bin/env node

import { env } from "@total-typescript/env";
import {
  createAutoEditedVideo,
  extractAudioFromVideo,
  renderSubtitles,
  transcribeAudio,
} from "@total-typescript/ffmpeg";
import { toDashCase, type AbsolutePath } from "@total-typescript/shared";
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import readline from "readline/promises";
import prompts from "prompts";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { commands } from "./commands.js";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import { validateWindowsFilename } from "./validateWindowsFilename.js";

const { prompt } = prompts;

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

    await createAutoEditedVideo({
      inputVideo: latestVideo,
      outputVideo: tempOutputPath,
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

program
  .command("transcribe-video")
  .aliases(["t", "transcribe"])
  .description("Transcribe audio from a selected video file")
  .action(async () => {
    // Get all files from both directories
    const [exportFiles, shortsFiles] = await Promise.all([
      fs.readdir(env.EXPORT_DIRECTORY_IN_UNIX),
      fs.readdir(env.SHORTS_EXPORT_DIRECTORY),
    ]);

    // Get stats for all files in parallel
    const exportStats = await Promise.all(
      exportFiles
        .filter((file) => file.endsWith(".mp4"))
        .map(async (file) => {
          const fullPath = path.join(
            env.EXPORT_DIRECTORY_IN_UNIX,
            file
          ) as AbsolutePath;
          const stats = await fs.stat(fullPath);
          return {
            title: `Export: ${file}`,
            value: fullPath,
            mtime: stats.mtime,
          };
        })
    );

    const shortsStats = await Promise.all(
      shortsFiles
        .filter((file) => file.endsWith(".mp4"))
        .map(async (file) => {
          const fullPath = path.join(
            env.SHORTS_EXPORT_DIRECTORY,
            file
          ) as AbsolutePath;
          const stats = await fs.stat(fullPath);
          return {
            title: `Shorts: ${file}`,
            value: fullPath,
            mtime: stats.mtime,
          };
        })
    );

    // Combine and sort by modification time (newest first)
    const videoFiles = [...exportStats, ...shortsStats].sort(
      (a, b) => b.mtime.getTime() - a.mtime.getTime()
    );

    if (videoFiles.length === 0) {
      console.error("No video files found in either directory");
      process.exit(1);
    }

    const { selectedVideo } = await prompt({
      type: "select",
      name: "selectedVideo",
      message: "Choose a video to transcribe:",
      choices: videoFiles.map(({ title, value }) => ({ title, value })),
    });

    if (!selectedVideo) {
      console.error("No video selected");
      process.exit(1);
    }

    console.log("Transcribing video...");

    const audioPath = path.join(
      path.dirname(selectedVideo),
      `${path.basename(selectedVideo)}.mp3`
    ) as AbsolutePath;

    await extractAudioFromVideo(selectedVideo, audioPath);

    const transcript = await transcribeAudio(audioPath);

    await fs.unlink(audioPath);
    console.log("\nTranscript:");
    console.log(transcript);
  });

program.parse(process.argv);
