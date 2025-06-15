#!/usr/bin/env node

import {
  addCurrentTimelineToRenderQueue,
  appendVideoToTimeline,
  createAutoEditedVideoWorkflow,
  createTimeline,
  exportSubtitles,
  getLatestOBSVideo,
  moveRawFootageToLongTermStorage,
  transcribeVideoWorkflow,
  ffmpeg,
  type Context,
} from "@total-typescript/ffmpeg";
import * as fs from "fs/promises";
import { type AbsolutePath } from "@total-typescript/shared";
import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { env } from "./env.js";
import { promptForFilename, promptForVideoSelection } from "./utils.js";

const ctx: Context = {
  ffmpeg,
  fs,
  transcriptionDirectory: env.TRANSCRIPTION_DIRECTORY,
};

const program = new Command();

program.version(packageJson.version);

// Simple commands
program
  .command("move-raw-footage-to-long-term-storage")
  .description("Move raw footage to long term storage.")
  .action(async () => {
    moveRawFootageToLongTermStorage({
      obsOutputDirectory: env.OBS_OUTPUT_DIRECTORY,
      longTermStorageDirectory: env.LONG_TERM_FOOTAGE_STORAGE_DIRECTORY,
    });
  });

program
  .command("create-timeline")
  .description("Create a new empty timeline in the current project.")
  .action(async () => {
    await createTimeline();
  });

program
  .command("add-current-timeline-to-render-queue")
  .description("Add the current timeline to the render queue.")
  .action(async () => {
    await addCurrentTimelineToRenderQueue({
      davinciExportDirectory: env.DAVINCI_EXPORT_DIRECTORY,
    });
  });

program
  .command("export-subtitles")
  .description("Export subtitles from the current timeline as SRT.")
  .action(async () => {
    await exportSubtitles({
      davinciExportDirectory: env.DAVINCI_EXPORT_DIRECTORY,
    });
  });

program
  .command("append-video-to-timeline [video]")
  .aliases(["a", "append"])
  .description("Append video to the current Davinci Resolve timeline")
  .action(async (video: string | undefined) => {
    await appendVideoToTimeline({
      inputVideo: video as AbsolutePath,
      getLatestOBSVideo: () =>
        getLatestOBSVideo(env.OBS_OUTPUT_DIRECTORY as AbsolutePath),
      ctx,
    });
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
    await createAutoEditedVideoWorkflow({
      getLatestVideo: () =>
        getLatestOBSVideo(env.OBS_OUTPUT_DIRECTORY as AbsolutePath),
      promptForFilename,
      exportDirectory: env.EXPORT_DIRECTORY_IN_UNIX,
      shortsExportDirectory: env.SHORTS_EXPORT_DIRECTORY,
      dryRun: options.dryRun,
      subtitles: options.subtitles,
      ctx,
    }).mapErr(async (err) => {
      console.error(err);

      await new Promise((res) => setTimeout(res, 5000));
      process.exit(1);
    });
  });

program
  .command("transcribe-video")
  .aliases(["t", "transcribe"])
  .description("Transcribe audio from a selected video file")
  .action(async () => {
    await transcribeVideoWorkflow({
      exportDirectory: env.EXPORT_DIRECTORY_IN_UNIX,
      shortsExportDirectory: env.SHORTS_EXPORT_DIRECTORY,
      promptForVideoSelection,
      ctx,
    });
  });

program.parse(process.argv);
