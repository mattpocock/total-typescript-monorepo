#!/usr/bin/env node

import {
  addCurrentTimelineToRenderQueue,
  appendVideoToTimeline,
  AppLayerLive,
  createAutoEditedVideoWorkflow,
  createTimeline,
  doesQueueLockfileExist,
  exportSubtitles,
  getQueueState,
  moveRawFootageToLongTermStorage,
  processQueue,
  QueueRunnerService,
  transcribeVideoWorkflow,
  writeToQueue,
  type QueueItem,
} from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import { styleText } from "node:util";
import {
  AskQuestionService,
  OBSIntegrationService,
} from "../../../packages/ffmpeg/dist/services.js";
import packageJson from "../package.json" with { type: "json" };

const program = new Command();

program.version(packageJson.version);

// Simple commands
program
  .command("move-raw-footage-to-long-term-storage")
  .description("Move raw footage to long term storage.")
  .action(() => {
    moveRawFootageToLongTermStorage().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runFork
    );
  });

program
  .command("create-timeline")
  .description("Create a new empty timeline in the current project.")
  .action(() => {
    createTimeline().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runFork
    );
  });

program
  .command("add-current-timeline-to-render-queue")
  .description("Add the current timeline to the render queue.")
  .action(() => {
    addCurrentTimelineToRenderQueue().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runFork
    );
  });

program
  .command("export-subtitles")
  .description("Export subtitles from the current timeline as SRT.")
  .action(() => {
    exportSubtitles().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runFork
    );
  });

program
  .command("append-video-to-timeline [video]")
  .aliases(["a", "append"])
  .description("Append video to the current Davinci Resolve timeline")
  .action((video: string | undefined) => {
    appendVideoToTimeline({
      inputVideo: video as AbsolutePath,
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runFork
    );
  });

program
  .command("create-auto-edited-video")
  .aliases(["v", "video"])
  .description(
    `Create a new auto-edited video from the latest OBS recording and save it to the export directory`
  )
  .option("-d, --dry-run", "Run without saving to Dropbox")
  .option("-ns, --no-subtitles", "Disable subtitle rendering")
  .action((options: { dryRun?: boolean; subtitles?: boolean }) => {
    Effect.gen(function* () {
      const obs = yield* OBSIntegrationService;
      const askQuestion = yield* AskQuestionService;

      const inputVideo = yield* obs.getLatestOBSVideo();

      yield* Effect.log("Adding to queue...");

      yield* writeToQueue([
        {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          action: {
            type: "create-auto-edited-video",
            inputVideo,
            videoName: yield* askQuestion.askQuestion(
              "What is the name of the video?"
            ),
            subtitles: Boolean(options.subtitles),
            dryRun: Boolean(options.dryRun),
          },
          status: "idle",
        },
      ]);
    }).pipe(
      Effect.catchAll((e) => {
        return Effect.gen(function* () {
          yield* Effect.logError(e);
          yield* Effect.sleep(5000);
          return yield* Effect.die(e);
        });
      }),
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runFork
    );
  });

program
  .command("transcribe-video")
  .aliases(["t", "transcribe"])
  .description("Transcribe audio from a selected video file")
  .action(() => {
    transcribeVideoWorkflow().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runFork
    );
  });

const QueueLayerLive = Layer.merge(
  AppLayerLive,
  Layer.succeed(QueueRunnerService, {
    createAutoEditedVideoWorkflow: (params) => {
      return createAutoEditedVideoWorkflow(params).pipe(
        Effect.provide(AppLayerLive)
      );
    },
  })
);

program
  .command("process-queue")
  .aliases(["p", "process"])
  .description("Process the queue.")
  .action(() => {
    processQueue().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(QueueLayerLive),
      Effect.runFork
    );
  });

program
  .command("queue-status")
  .aliases(["qs", "status"])
  .description("Show the status of the render queue.")
  .action(() => {
    Effect.gen(function* () {
      const queueState = yield* getQueueState();

      const uncompleted = queueState.queue.filter(
        (q: QueueItem) => q.status !== "completed"
      );
      if (queueState.queue.length === 0) {
        yield* Effect.log("(Queue is empty)");
        return;
      }
      yield* Effect.forEach(
        queueState.queue,
        (item: QueueItem, idx: number) => {
          return Effect.gen(function* () {
            const completed = formatRelativeDate(item.completedAt);
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
              `${styleText("bold", `#${idx + 1}`)} ${statusIcon}\n` +
                (isAutoEdit
                  ? `  ${styleText("dim", "Title")}      ${item.action.videoName}\n` +
                    (options.length > 0
                      ? `  ${styleText("dim", "Options")}    ${options.join(", ")}\n`
                      : "")
                  : "") +
                `  ${styleText("dim", "Completed")}  ${completed}` +
                (item.error
                  ? `\n  ${styleText("dim", "Error")}      ${item.error}`
                  : "") +
                "\n"
            );
          });
        }
      );

      if (uncompleted.length === 0) {
        console.log("✅ All queue items are completed!");
      } else {
        console.log(
          `⏳ There are ${uncompleted.length} uncompleted item(s) in the queue.`
        );
        const isProcessing = yield* doesQueueLockfileExist();
        if (isProcessing) {
          console.log("🔄 Queue processor is currently running.");
        } else {
          console.log("⏹️  Queue processor is NOT running.");
        }
      }
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(QueueLayerLive),
      Effect.runFork
    );
  });

// Utility to format a date as 'today', 'yesterday', or a formatted date
function formatRelativeDate(dateInput: number | Date | undefined): string {
  if (!dateInput) return "-";
  const completedDate = new Date(dateInput);
  const now = new Date();
  const isToday =
    completedDate.getFullYear() === now.getFullYear() &&
    completedDate.getMonth() === now.getMonth() &&
    completedDate.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    completedDate.getFullYear() === yesterday.getFullYear() &&
    completedDate.getMonth() === yesterday.getMonth() &&
    completedDate.getDate() === yesterday.getDate();
  const time = completedDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return completedDate.toLocaleString();
}

program.parse(process.argv);
