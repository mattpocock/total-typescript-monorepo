#!/usr/bin/env node

import { FileSystem } from "@effect/platform";
import {
  addCurrentTimelineToRenderQueue,
  appendVideoToTimeline,
  AppLayerLive,
  createTimeline,
  createAutoEditedVideoQueueItems,
  doesQueueLockfileExist,
  exportSubtitles,
  generateArticleFromTranscript,
  getOutstandingInformationRequests,
  getQueueState,
  moveRawFootageToLongTermStorage,
  multiSelectVideosFromQueue,
  processInformationRequests,
  processQueue,
  transcribeVideoWorkflow,
  validateWindowsFilename,
  writeToQueue,
  type QueueItem,
} from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import { Command } from "commander";
import { config } from "dotenv";
import { ConfigProvider, Console, Effect, Layer } from "effect";
import path from "node:path";
import { styleText } from "node:util";
import {
  AIService,
  AskQuestionService,
  OBSIntegrationService,
  TranscriptStorageService,
} from "../../../packages/ffmpeg/dist/services.js";
import packageJson from "../package.json" with { type: "json" };
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

// Simple commands
program
  .command("move-raw-footage-to-long-term-storage")
  .description("Move raw footage to long term storage.")
  .action(async () => {
    await moveRawFootageToLongTermStorage().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      Effect.runPromise
    );
  });

program
  .command("create-timeline")
  .description("Create a new empty timeline in the current project.")
  .action(async () => {
    await createTimeline().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      Effect.runPromise
    );
  });

program
  .command("add-current-timeline-to-render-queue")
  .description("Add the current timeline to the render queue.")
  .action(async () => {
    await addCurrentTimelineToRenderQueue().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      Effect.runPromise
    );
  });

program
  .command("export-subtitles")
  .description("Export subtitles from the current timeline as SRT.")
  .action(async () => {
    await exportSubtitles().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
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
      Effect.provide(MainLayerLive),
      Effect.runPromise
    );
  });

program
  .command("create-auto-edited-video")
  .aliases(["v", "video"])
  .description(
    `Create a new auto-edited video from the latest OBS recording and save it to the export directory`
  )
  .option("-u, --upload", "Upload to shorts directory")
  .option("-ns, --no-subtitles", "Disable subtitle rendering")
  .option(
    "-ga, --generate-article",
    "Automatically generate an article from the video transcript"
  )
  .action(
    async (options: {
      upload?: boolean;
      subtitles?: boolean;
      generateArticle?: boolean;
    }) => {
      await Effect.gen(function* () {
        const obs = yield* OBSIntegrationService;
        const askQuestion = yield* AskQuestionService;
        const fs = yield* FileSystem.FileSystem;

        const inputVideo = yield* obs.getLatestOBSVideo();

        yield* Console.log("Adding to queue...");

        const videoName = yield* askQuestion.askQuestion(
          "What is the name of the video?"
        );

        yield* validateWindowsFilename(videoName);

        // If article generation is enabled, ask for code file synchronously
        let codePath: string | undefined;
        let codeContent: string | undefined;

        if (options.generateArticle) {
          yield* Console.log(
            "📝 Article generation enabled - gathering code information..."
          );

          const codeFileInput = yield* askQuestion.askQuestion(
            "Enter the file path containing any code for the article (optional, press Enter to skip):"
          );

          if (codeFileInput.trim()) {
            const inputCodePath = codeFileInput.trim();
            const codeExists = yield* fs
              .exists(inputCodePath)
              .pipe(Effect.catchAll(() => Effect.succeed(false)));

            if (codeExists) {
              const content = yield* fs.readFileString(inputCodePath).pipe(
                Effect.catchAll((error) => {
                  return Effect.gen(function* () {
                    yield* Console.log(
                      `⚠️  Warning: Could not read code file ${inputCodePath}: ${error}`
                    );
                    yield* Console.log(
                      `💡 Tip: Check file permissions and ensure the path is correct`
                    );
                    return "";
                  });
                })
              );

              if (content) {
                codePath = inputCodePath;
                codeContent = content;
                yield* Console.log(
                  `✅ Code file loaded: ${inputCodePath} (${content.length} characters)`
                );
              }
            } else {
              yield* Console.log(
                `⚠️  Warning: Code file ${inputCodePath} does not exist`
              );
              yield* Console.log(
                `💡 Continuing without code - you can manually add code examples to the article later`
              );
            }
          } else {
            yield* Console.log(
              `ℹ️  No code file provided - continuing without code examples`
            );
          }
        }

        const queueItems = yield* createAutoEditedVideoQueueItems({
          inputVideo,
          videoName,
          subtitles: Boolean(options.subtitles),
          dryRun: !Boolean(options.upload),
          generateArticle: Boolean(options.generateArticle),
          codePath,
          codeContent,
        });

        if (options.generateArticle) {
          yield* Console.log(
            "Article generation enabled - adding workflow queue items..."
          );
        }

        yield* writeToQueue(queueItems);

        if (options.generateArticle) {
          yield* Console.log(
            `Added ${queueItems.length} items to queue for video processing with article generation.`
          );
        } else {
          yield* Console.log("Added video processing item to queue.");
        }
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
        Effect.runPromise
      );
    }
  );

program
  .command("transcribe-video")
  .aliases(["t", "transcribe"])
  .description("Transcribe audio from a selected video file")
  .action(async () => {
    await transcribeVideoWorkflow().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
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
      Effect.provide(MainLayerLive),
      Effect.runPromise
    );
  });

program
  .command("process-information-requests")
  .aliases(["pir", "info-requests"])
  .description(
    "Check for and process outstanding information requests in the queue."
  )
  .action(async () => {
    await Effect.gen(function* () {
      const informationRequests = yield* getOutstandingInformationRequests();

      if (informationRequests.length === 0) {
        yield* Console.log("No outstanding information requests found.");
        return;
      }

      yield* Console.log(
        `Found ${informationRequests.length} outstanding information request(s).`
      );
      yield* processInformationRequests();
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
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
      Effect.provide(MainLayerLive),
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

      // Filter queue items based on requirements:
      // 1. All outstanding items (ready-to-run, requires-user-input)
      // 2. All failed items
      // 3. Today's and Yesterday's successful items
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const filteredQueue = queueState.queue.filter((item: QueueItem) => {
        // Show all outstanding items
        if (
          item.status === "ready-to-run" ||
          item.status === "requires-user-input"
        ) {
          return true;
        }

        // Show all failed items
        if (item.status === "failed") {
          return true;
        }

        // Show today's and yesterday's successful items
        if (item.status === "completed" && item.completedAt) {
          const completedDate = new Date(item.completedAt);
          const completedDay = new Date(
            completedDate.getFullYear(),
            completedDate.getMonth(),
            completedDate.getDate()
          );

          return (
            completedDay.getTime() === today.getTime() ||
            completedDay.getTime() === yesterday.getTime()
          );
        }

        return false;
      });

      if (filteredQueue.length === 0) {
        yield* Effect.log("(No relevant queue items to display)");
        return;
      }

      const uncompleted = filteredQueue.filter(
        (q: QueueItem) => q.status !== "completed"
      );

      yield* Effect.forEach(filteredQueue, (item: QueueItem, idx: number) => {
        return Effect.gen(function* () {
          const completed = formatRelativeDate(item.completedAt);
          let statusIcon = "";
          switch (item.status) {
            case "completed":
              statusIcon = "✅";
              break;
            case "failed":
              statusIcon = "❌";
              break;
            case "requires-user-input":
              statusIcon = "❓";
              break;
            default:
              statusIcon = "⏳";
          }

          let actionContent = "";
          if (item.action.type === "create-auto-edited-video") {
            let options = [];
            if (!item.action.dryRun) options.push("Upload");
            if (item.action.subtitles) options.push("Subtitles");

            actionContent =
              `  ${styleText("dim", "Title")}      ${item.action.videoName}\n` +
              (options.length > 0
                ? `  ${styleText("dim", "Options")}    ${options.join(", ")}\n`
                : "");
          } else if (item.action.type === "links-request") {
            actionContent =
              `  ${styleText("dim", "Type")}       Information Request\n` +
              `  ${styleText("dim", "Links")}      ${item.action.linkRequests.length} link(s) requested\n`;
          } else if (item.action.type === "concatenate-videos") {
            let options = [];
            if (!item.action.dryRun) options.push("Upload");

            actionContent =
              `  ${styleText("dim", "Title")}      ${item.action.outputVideoName}\n` +
              `  ${styleText("dim", "Videos")}     ${item.action.videoIds.length} video(s)\n` +
              (options.length > 0
                ? `  ${styleText("dim", "Options")}    ${options.join(", ")}\n`
                : "");
          }

          yield* Console.log(
            `${styleText("bold", `#${idx + 1}`)} ${statusIcon}\n` +
              actionContent +
              `  ${styleText("dim", "Status")}     ${item.status}\n` +
              `  ${styleText("dim", "Completed")}  ${completed}` +
              (item.error
                ? `\n  ${styleText("dim", "Error")}      ${item.error}`
                : "") +
              "\n"
          );
        });
      });

      if (uncompleted.length === 0) {
        yield* Console.log("✅ All outstanding queue items are completed!");
      } else {
        yield* Console.log(
          `⏳ There are ${uncompleted.length} outstanding item(s) in the queue.`
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
      Effect.provide(MainLayerLive),
      Effect.withSpan("queue-status"),
      Effect.runPromise
    );
  });

program
  .command("concatenate-videos")
  .aliases(["concat", "c"])
  .description("Concatenate multiple completed videos from the queue")
  .option("-u, --upload", "Upload to shorts directory")
  .action(async (options: { upload?: boolean }) => {
    await Effect.gen(function* () {
      const askQuestion = yield* AskQuestionService;

      // Select videos using the multi-selection interface
      const selectedVideoIds = yield* multiSelectVideosFromQueue();

      if (selectedVideoIds.length === 0) {
        yield* Console.log("No videos selected. Cancelling concatenation.");
        return;
      }

      if (selectedVideoIds.length === 1) {
        yield* Console.log(
          "Only one video selected. At least 2 videos are required for concatenation."
        );
        return;
      }

      // Ask for output video name
      const outputVideoName = yield* askQuestion.askQuestion(
        "What is the name for the concatenated video?"
      );

      yield* validateWindowsFilename(outputVideoName);

      yield* Console.log("Adding concatenation job to queue...");

      yield* writeToQueue([
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
        `✅ Concatenation job added to queue with ${selectedVideoIds.length} videos.`
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
