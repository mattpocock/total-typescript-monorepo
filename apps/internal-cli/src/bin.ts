#!/usr/bin/env node

import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  multiSelectVideosFromQueue,
  validateWindowsFilename,
} from "@total-typescript/ffmpeg";
import { Command } from "commander";
import { config } from "dotenv";
import { Config, ConfigProvider, Console, Effect, Layer } from "effect";
import path from "node:path";
import { QueueUpdaterService } from "../../../packages/ffmpeg/dist/queue/queue-updater-service.js";
import { AskQuestionService } from "../../../packages/ffmpeg/dist/services.js";
import packageJson from "../package.json" with { type: "json" };
import { register as registerCreateVideoFromClips } from "./commands/create-video-from-clips.js";
import { register as registerGetClipsFromLatestVideo } from "./commands/get-clips-from-latest-video.js";
import { register as registerSendClipsToDavinciResolve } from "./commands/send-clips-to-davinci-resolve.js";
import { register as registerAddCurrentTimelineToRenderQueue } from "./commands/add-current-timeline-to-render-queue.js";
import { register as registerCreateTimeline } from "./commands/create-timeline.js";
import { register as registerMoveRawFootageToLongTermStorage } from "./commands/move-raw-footage-to-long-term-storage.js";
import { register as registerTranscribeClips } from "./commands/transcribe-clips.js";
import { register as registerExportSubtitles } from "./commands/export-subtitles.js";
import { register as registerAppendVideoToTimeline } from "./commands/append-video-to-timeline.js";
import { register as registerEditInterview } from "./commands/edit-interview.js";
import { register as registerExportInterview } from "./commands/export-interview.js";
import { register as registerMoveInterviewToDavinciResolve } from "./commands/move-interview-to-davinci-resolve.js";
import { register as registerCreateAutoEditedVideo } from "./commands/create-auto-edited-video.js";
import { register as registerLogLatestObsVideo } from "./commands/log-latest-obs-video.js";
import { register as registerQueueAutoEditedVideoForCourse } from "./commands/queue-auto-edited-video-for-course.js";
import { register as registerTranscribeVideo } from "./commands/transcribe-video.js";
import { register as registerProcessQueue } from "./commands/process-queue.js";
import { register as registerProcessInformationRequests } from "./commands/process-information-requests.js";
import { register as registerArticleFromTranscript } from "./commands/article-from-transcript.js";
import { register as registerQueueStatus } from "./commands/queue-status.js";
import { OpenTelemetryLive } from "./tracing.js";

config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

const program = new Command();

program.version(packageJson.version);

// Register extracted commands
registerAddCurrentTimelineToRenderQueue(program);
registerCreateTimeline(program);
registerCreateVideoFromClips(program);
registerGetClipsFromLatestVideo(program);
registerMoveRawFootageToLongTermStorage(program);
registerSendClipsToDavinciResolve(program);
registerTranscribeClips(program);
registerExportSubtitles(program);
registerAppendVideoToTimeline(program);
registerEditInterview(program);
registerExportInterview(program);
registerMoveInterviewToDavinciResolve(program);
registerCreateAutoEditedVideo(program);
registerLogLatestObsVideo(program);
registerQueueAutoEditedVideoForCourse(program);
registerTranscribeVideo(program);
registerProcessQueue(program);
registerProcessInformationRequests(program);
registerArticleFromTranscript(program);
registerQueueStatus(program);

program
  .command("concatenate-videos")
  .aliases(["concat", "c"])
  .description("Concatenate multiple completed videos from the queue")
  .option("-u, --upload", "Upload to shorts directory")
  .action(async (options: { upload?: boolean }) => {
    await Effect.gen(function* () {
      const queueUpdater = yield* QueueUpdaterService;
      const askQuestion = yield* AskQuestionService;

      // Select videos using the multi-selection interface
      const selectedVideoIds = yield* multiSelectVideosFromQueue();

      if (selectedVideoIds.length === 0) {
        yield* Console.log("No videos selected. Cancelling concatenation.");
        return;
      }

      if (selectedVideoIds.length === 1) {
        yield* Console.log(
          "Only one video selected. At least 2 videos are required for concatenation.",
        );
        return;
      }

      // Ask for output video name
      const outputVideoName = yield* askQuestion.askQuestion(
        "What is the name for the concatenated video?",
      );

      yield* validateWindowsFilename(outputVideoName);

      yield* Console.log("Adding concatenation job to queue...");

      yield* queueUpdater.writeToQueue([
        {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          action: {
            type: "concatenate-videos",
            videoIds: selectedVideoIds,
            outputVideoName,
            dryRun: !Boolean(options.upload),
          },
          dependencies: selectedVideoIds, // Depend on all selected videos being completed
          status: "ready-to-run",
        },
      ]);

      yield* Console.log(
        `✅ Concatenation job added to queue with ${selectedVideoIds.length} videos.`,
      );
    }).pipe(
      Effect.catchAll((e) => {
        return Effect.gen(function* () {
          yield* Effect.logError(e);
          yield* Effect.sleep(5000);
          return yield* Effect.die(e);
        });
      }),
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      NodeRuntime.runMain,
    );
  });

program
  .command("notify <text>")
  .description("Send a notification to the Zapier webhook")
  .action(async (text: string) => {
    await Effect.gen(function* () {
      const webhookUrl = yield* Config.string("ZAPIER_NOTIFICATION_WEBHOOK");

      yield* Effect.tryPromise({
        try: () =>
          fetch(webhookUrl, {
            method: "POST",
            body: text,
          }),
        catch: (error) => new Error(`Failed to send notification: ${error}`),
      });

      yield* Console.log("Notification sent");
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      NodeRuntime.runMain,
    );
  });

program
  .command("retry-queue-item")
  .aliases(["rq"])
  .action(async () => {
    Effect.gen(function* () {
      const queueUpdater = yield* QueueUpdaterService;
      const { queue } = yield* queueUpdater.getQueueState();

      const mostRecentlyFailedItem = queue.findLast(
        (item) => item.status === "failed",
      );

      if (!mostRecentlyFailedItem) {
        yield* Console.log("No failed queue items found");
        return;
      }

      yield* queueUpdater.updateQueueItem({
        ...mostRecentlyFailedItem,
        status: "ready-to-run",
        error: undefined,
      });
      yield* Console.log("Marked queue item as ready-to-run");
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      NodeRuntime.runMain,
    );
  });

program.parse(process.argv);
