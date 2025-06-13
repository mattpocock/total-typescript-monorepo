#!/usr/bin/env node

import { env, EnvService, realEnvService } from "@total-typescript/env";
import {
  extractAudioFromVideo,
  transcribeAudio,
} from "@total-typescript/ffmpeg";
import {
  ExecService,
  realExecService,
  toDashCase,
  type AbsolutePath,
} from "@total-typescript/shared";
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { commands } from "./commands.js";
import { Effect, pipe } from "effect";
import { createAutoEditedVideoCommand } from "./create-auto-edited-video-command.js";
import {
  AskQuestionService,
  realAskQuestionService,
} from "./ask-question-service.js";
import { NodeContext, NodeRuntime } from "@effect/platform-node";

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
  .description("Append video to the current Davinci Resolve timeline")
  .action(async (video: string | undefined) => {
    await appendVideoToTimeline(video);
  });

program
  .command("create-auto-edited-video")
  .aliases(["v", "video"])
  .description(
    `Create a new auto-edited video from the latest OBS recording and save it to the export directory`
  )
  .option("-d, --dry-run", "Run without saving to Dropbox")
  .option("-ns, --no-subtitles", "Disable subtitle rendering")
  .action(async (options: { dryRun?: boolean; subtitles?: boolean }) => {
    const program = pipe(
      createAutoEditedVideoCommand({
        dryRun: options.dryRun ?? false,
        subtitles: options.subtitles ?? true,
      }),
      Effect.provideService(ExecService, realExecService),
      Effect.provideService(AskQuestionService, realAskQuestionService),
      Effect.provideService(EnvService, realEnvService),
      NodeRuntime.runMain
    );
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
