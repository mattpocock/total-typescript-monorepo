#!/usr/bin/env node

import { FileSystem } from "@effect/platform";
import {
  addCurrentTimelineToRenderQueue,
  appendVideoToTimeline,
  AppLayerLive,
  createTimeline,
  doesQueueLockfileExist,
  exportSubtitles,
  generateArticleFromTranscript,
  getQueueState,
  moveRawFootageToLongTermStorage,
  processQueue,
  transcribeVideoWorkflow,
  validateWindowsFilename,
  writeToQueue,
  type QueueItem,
} from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import { Command } from "commander";
import { config } from "dotenv";
import { ConfigProvider, Console, Effect } from "effect";
import path from "node:path";
import { styleText } from "node:util";
import {
  AIService,
  AskQuestionService,
  OBSIntegrationService,
  TranscriptStorageService,
} from "../../../packages/ffmpeg/dist/services.js";
import packageJson from "../package.json" with { type: "json" };

config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

const program = new Command();

program.version(packageJson.version);

// Simple commands
program
  .command("move-raw-footage-to-long-term-storage")
  .description("Move raw footage to long term storage.")
  .action(async () => {
    await moveRawFootageToLongTermStorage().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
    );
  });

program
  .command("create-timeline")
  .description("Create a new empty timeline in the current project.")
  .action(async () => {
    await createTimeline().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
    );
  });

program
  .command("add-current-timeline-to-render-queue")
  .description("Add the current timeline to the render queue.")
  .action(async () => {
    await addCurrentTimelineToRenderQueue().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
    );
  });

program
  .command("export-subtitles")
  .description("Export subtitles from the current timeline as SRT.")
  .action(async () => {
    await exportSubtitles().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
    );
  });

program
  .command("append-video-to-timeline [video]")
  .aliases(["a", "append"])
  .description("Append video to the current Davinci Resolve timeline")
  .action(async (video: string | undefined) => {
    await appendVideoToTimeline({
      inputVideo: video as AbsolutePath,
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
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
  .action(async (options: { dryRun?: boolean; subtitles?: boolean }) => {
    await Effect.gen(function* () {
      const obs = yield* OBSIntegrationService;
      const askQuestion = yield* AskQuestionService;

      const inputVideo = yield* obs.getLatestOBSVideo();

      yield* Console.log("Adding to queue...");

      const videoName = yield* askQuestion.askQuestion(
        "What is the name of the video?"
      );

      yield* validateWindowsFilename(videoName);

      yield* writeToQueue([
        {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          action: {
            type: "create-auto-edited-video",
            inputVideo,
            videoName,
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
      Effect.runPromise
    );
  });

program
  .command("transcribe-video")
  .aliases(["t", "transcribe"])
  .description("Transcribe audio from a selected video file")
  .action(async () => {
    await transcribeVideoWorkflow().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
    );
  });

program
  .command("process-queue")
  .aliases(["p", "process"])
  .description("Process the queue.")
  .action(async () => {
    await processQueue().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
    );
  });

program
  .command("article-from-transcript")
  .aliases(["aft", "article"])
  .description("Generate an article from a transcript")
  .action(async () => {
    const program = Effect.gen(function* () {
      const transcriptStorage = yield* TranscriptStorageService;
      const askQuestion = yield* AskQuestionService;
      const ai = yield* AIService;
      const transcripts = yield* transcriptStorage.getTranscripts();
      const fs = yield* FileSystem.FileSystem;

      const transcriptPath = yield* askQuestion.select(
        "Select a transcript",
        transcripts.map((p) => ({
          title: path.basename(p),
          value: p,
        }))
      );

      let code: string | undefined;

      const codePath = yield* askQuestion.askQuestion(
        "Enter the file path containing any code for the article (optional)"
      );

      if (codePath) {
        const codeContent = yield* fs.readFileString(codePath);
        code = codeContent;
      }

      const transcriptContent = yield* fs.readFileString(transcriptPath);

      const originalVideoPath =
        yield* transcriptStorage.getOriginalVideoPathFromTranscript({
          transcriptPath: transcriptPath,
        });

      const urls: { request: string; url: string }[] = [];

      const urlRequests = yield* ai.askForLinks({
        transcript: transcriptContent,
      });

      for (const urlRequest of urlRequests) {
        const url = yield* askQuestion.askQuestion(urlRequest);
        urls.push({ request: urlRequest, url });
      }

      yield* generateArticleFromTranscript({
        originalVideoPath,
        transcript: transcriptContent,
        code,
        urls,
      });
    });

    await program.pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
    );
  });

program
  .command("queue-status")
  .aliases(["qs", "status"])
  .description("Show the status of the render queue.")
  .action(async () => {
    await Effect.gen(function* () {
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

            yield* Console.log(
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
        yield* Console.log("✅ All queue items are completed!");
      } else {
        yield* Console.log(
          `⏳ There are ${uncompleted.length} uncompleted item(s) in the queue.`
        );
        const isProcessing = yield* doesQueueLockfileExist();
        if (isProcessing) {
          yield* Console.log("🔄 Queue processor is currently running.");
        } else {
          yield* Console.log("⏹️  Queue processor is NOT running.");
        }
      }
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(AppLayerLive),
      Effect.runPromise
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
