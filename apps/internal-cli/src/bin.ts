#!/usr/bin/env node

import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive } from "@total-typescript/ffmpeg";
import { Command } from "commander";
import { config } from "dotenv";
import { Config, ConfigProvider, Console, Effect, Layer } from "effect";
import path from "node:path";
import { QueueUpdaterService } from "../../../packages/ffmpeg/dist/queue/queue-updater-service.js";
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
import { register as registerConcatenateVideos } from "./commands/concatenate-videos.js";
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
registerConcatenateVideos(program);

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
