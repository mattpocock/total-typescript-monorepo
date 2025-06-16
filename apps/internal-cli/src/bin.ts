#!/usr/bin/env node

import {
  addCurrentTimelineToRenderQueue,
  appendVideoToTimeline,
  createTimeline,
  exportSubtitles,
  getLatestOBSVideo,
  moveRawFootageToLongTermStorage,
  transcribeVideoWorkflow,
  ffmpeg,
  type Context,
  processQueue,
  writeToQueue,
  getQueueState,
  type QueueItem,
} from "@total-typescript/ffmpeg";
import * as fs from "fs/promises";
import { type AbsolutePath } from "@total-typescript/shared";
import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { env } from "./env.js";
import { promptForFilename, promptForVideoSelection } from "./utils.js";
import path from "path";
import { okAsync, safeTry } from "neverthrow";

const ctx: Context = {
  ffmpeg,
  fs,
  transcriptionDirectory: env.TRANSCRIPTION_DIRECTORY,
  queueLocation: path.join(import.meta.dirname, "..", "queue.json"),
  queueLockfileLocation: path.join(import.meta.dirname, "..", "queue.lock"),
  exportDirectory: env.EXPORT_DIRECTORY_IN_UNIX,
  shortsExportDirectory: env.SHORTS_EXPORT_DIRECTORY,
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
    const videoName = await promptForFilename();

    await safeTry(async function* () {
      const inputVideo = yield* getLatestOBSVideo(
        env.OBS_OUTPUT_DIRECTORY as AbsolutePath
      );

      console.log("Adding to queue...");

      await writeToQueue(
        [
          {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            action: {
              type: "create-auto-edited-video",
              inputVideo,
              videoName: videoName,
              subtitles: Boolean(options.subtitles),
              dryRun: Boolean(options.dryRun),
            },
            status: "idle",
          },
        ],
        ctx
      );

      return okAsync(undefined);
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

program
  .command("process-queue")
  .aliases(["p", "process"])
  .description("Process the queue.")
  .action(async () => {
    await processQueue(ctx);
  });

program
  .command("queue-status")
  .aliases(["qs", "status"])
  .description("Show the status of the render queue.")
  .action(async () => {
    const queueState = await getQueueState(ctx);
    const uncompleted = queueState.queue.filter(
      (q: QueueItem) => q.status !== "completed"
    );
    if (queueState.queue.length === 0) {
      console.log("(Queue is empty)");
      return;
    }
    queueState.queue.forEach((item: QueueItem, idx: number) => {
      const completed = item.completedAt
        ? new Date(item.completedAt).toLocaleString()
        : "-";
      const isAutoEdit = item.action.type === "create-auto-edited-video";
      let statusIcon = "";
      switch (item.status) {
        case "completed":
          statusIcon = "✅";
          break;
        case "failed":
          statusIcon = "❌";
          break;
        default:
          statusIcon = "⏳";
      }
      let options = [];
      if (isAutoEdit) {
        if (item.action.dryRun) options.push("Dry Run");
        if (item.action.subtitles) options.push("Subtitles");
      }
      console.log(
        `#${idx + 1} ${statusIcon}\n` +
          (isAutoEdit
            ? `  Title      ${item.action.videoName}\n` +
              (options.length > 0 ? `  Options    ${options.join(", ")}\n` : "")
            : "") +
          `  Completed  ${completed}` +
          (item.error ? `\n  Error      ${item.error}` : "") +
          "\n"
      );
    });
    if (uncompleted.length === 0) {
      console.log("✅ All queue items are completed!");
    } else {
      console.log(
        `⏳ There are ${uncompleted.length} uncompleted item(s) in the queue.`
      );
    }
  });

program.parse(process.argv);
