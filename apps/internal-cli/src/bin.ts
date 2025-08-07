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
  WorkflowsService,
} from "@total-typescript/ffmpeg";
import { type AbsolutePath, execAsync } from "@total-typescript/shared";
import { Command } from "commander";
import { config } from "dotenv";
import { ConfigProvider, Console, Effect, Layer, Config, Data } from "effect";
import path from "node:path";
import { styleText } from "node:util";
import {
  AIService,
  AskQuestionService,
  OBSIntegrationService,
  TranscriptStorageService,
} from "../../../packages/ffmpeg/dist/services.js";
import packageJson from "../package.json" with { type: "json" };
import {
  validateCreateVideoFlags,
  FlagValidationError,
} from "./validate-cli-flags.js";
import { OpenTelemetryLive } from "./tracing.js";
import { runExerciseOrganizer } from "./exercise-organizer/cli-command.js";
import { type ExerciseOrganizerOptions } from "./exercise-organizer/types.js";
import { NodeFileSystem } from "@effect/platform-node";

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
  .command("edit-interview <hostVideo> <guestVideo> <outputPath>")
  .action(async (hostVideo, guestVideo, outputPath) => {
    await Effect.gen(function* () {
      const workflows = yield* WorkflowsService;

      yield* workflows.editInterviewWorkflow({
        hostVideo,
        guestVideo,
        outputPath,
      });
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      Effect.scoped,
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
  .option(
    "-a, --alongside",
    "Save generated article alongside the video (with video's name) instead of in article storage directory"
  )
  .action(
    async (options: {
      upload?: boolean;
      subtitles?: boolean;
      generateArticle?: boolean;
      alongside?: boolean;
    }) => {
      await Effect.gen(function* () {
        const obs = yield* OBSIntegrationService;
        const askQuestion = yield* AskQuestionService;

        const inputVideo = yield* obs.getLatestOBSVideo();

        yield* Console.log("Adding to queue...");

        // Validate flag combinations
        yield* validateCreateVideoFlags(options).pipe(
          Effect.catchAll((error: FlagValidationError) =>
            Effect.gen(function* () {
              yield* Console.error(error.errorMessage);
              for (const helpMessage of error.helpMessages) {
                yield* Console.log(helpMessage);
              }
              process.exit(1);
            })
          )
        );

        const videoName = yield* askQuestion.askQuestion(
          "What is the name of the video?"
        );

        yield* validateWindowsFilename(videoName);

        // If article generation is enabled, ask for code file synchronously
        let codeContent = "";
        let codePath = "";

        if (options.generateArticle) {
          yield* Console.log("📝 Article generation enabled");

          const fs = yield* FileSystem.FileSystem;
          const providedCodePath = yield* askQuestion.askQuestion(
            "📂 Code file path (optional, press Enter to skip): ",
            { optional: true }
          );

          if (providedCodePath.trim()) {
            codePath = providedCodePath.trim();
            const codeExists = yield* fs
              .exists(codePath)
              .pipe(Effect.catchAll(() => Effect.succeed(false)));

            if (codeExists) {
              codeContent = yield* fs.readFileString(codePath).pipe(
                Effect.catchAll((error) => {
                  return Effect.gen(function* () {
                    yield* Console.log(
                      `⚠️  Warning: Could not read code file ${codePath}: ${error}`
                    );
                    yield* Console.log(
                      `💡 Tip: Check file permissions and ensure the path is correct`
                    );
                    return "";
                  });
                })
              );
              yield* Console.log(
                `✅ Code file loaded: ${codePath} (${codeContent.length} characters)`
              );
            } else {
              yield* Console.log(
                `⚠️  Warning: Code file ${codePath} does not exist`
              );
              yield* Console.log(
                `💡 Continuing without code - you can manually add code examples to the article later`
              );
              codePath = ""; // Reset path if file doesn't exist
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
          alongside: Boolean(options.alongside),
          codeContent,
          codePath,
        });

        if (options.generateArticle) {
          yield* Console.log(
            "Article generation enabled - adding workflow queue items..."
          );
          if (options.alongside) {
            yield* Console.log(
              "Article will be saved alongside the video instead of in article storage directory."
            );
          }
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
  .command("queue-auto-edited-video-for-course <id>")
  .action(async (id: string) => {
    await Effect.gen(function* () {
      const obs = yield* OBSIntegrationService;
      const inputVideo = yield* obs.getLatestOBSVideo();

      yield* writeToQueue([
        {
          id: crypto.randomUUID(),
          action: {
            type: "create-auto-edited-video",
            inputVideo,
            videoName: id,
            dryRun: true,
            subtitles: false,
          },
          createdAt: Date.now(),
          status: "ready-to-run",
        },
      ]);
      console.log(inputVideo);
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
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
      Effect.provide(MainLayerLive),
      Effect.scoped,
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
      Effect.scoped,
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
          } else if (item.action.type === "analyze-transcript-for-links") {
            const transcriptName =
              item.action.transcriptPath
                .split("/")
                .pop()
                ?.replace(".txt", "") || "Unknown";
            actionContent =
              `  ${styleText("dim", "Type")}       Transcript Analysis\n` +
              `  ${styleText("dim", "Video")}      ${transcriptName}\n` +
              `  ${styleText("dim", "Purpose")}    Generate link requests for article\n`;
          } else if (item.action.type === "generate-article-from-transcript") {
            const articleAction = item.action; // TypeScript will narrow this automatically
            const transcriptName =
              articleAction.transcriptPath
                .split("/")
                .pop()
                ?.replace(".txt", "") || "Unknown";

            // Find dependency queue items to show context
            const linksDep = queueState.queue.find(
              (q: QueueItem) => q.id === articleAction.linksDependencyId
            );

            const codeStatus = articleAction.codeContent
              ? "✓ Code"
              : "✓ No code";
            const linksStatus =
              linksDep?.status === "completed" ? "✓ Links" : "⏳ Links pending";

            actionContent =
              `  ${styleText("dim", "Type")}       Article Generation\n` +
              `  ${styleText("dim", "Video")}      ${transcriptName}\n` +
              `  ${styleText("dim", "Dependencies")} ${codeStatus}, ${linksStatus}\n`;
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

      // Add workflow summary for article generation
      const articleWorkflows = yield* analyzeArticleWorkflows(queueState);
      if (articleWorkflows.length > 0) {
        yield* Console.log(
          styleText("bold", "\n📚 Article Generation Workflows:")
        );
        yield* Effect.forEach(articleWorkflows, (workflow, idx) => {
          return Effect.gen(function* () {
            const progressBar = generateProgressBar(workflow.steps);
            const statusIcon =
              workflow.status === "completed"
                ? "✅"
                : workflow.status === "failed"
                  ? "❌"
                  : workflow.status === "blocked"
                    ? "⚠️"
                    : "🔄";

            yield* Console.log(
              `${styleText("bold", `Workflow ${idx + 1}`)} ${statusIcon} ${workflow.videoName}\n` +
                `  ${styleText("dim", "Progress")}   ${progressBar}\n` +
                `  ${styleText("dim", "Status")}     ${workflow.statusDescription}\n`
            );
          });
        });
        yield* Console.log("");
      }

      if (uncompleted.length === 0) {
        yield* Console.log("✅ All outstanding queue items are completed!");
      } else {
        yield* Console.log(
          `⏳ There are ${uncompleted.length} outstanding item(s) in the queue.`
        );

        // Show information request summary
        const infoRequests = uncompleted.filter(
          (item: QueueItem) => item.status === "requires-user-input"
        );
        if (infoRequests.length > 0) {
          yield* Console.log(
            `❓ ${infoRequests.length} item(s) require user input. Run: ${styleText("bold", "pnpm cli pir")}`
          );
        }

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

// Analyze article generation workflows in the queue
const analyzeArticleWorkflows = Effect.fn("analyzeArticleWorkflows")(
  function* (queueState: { queue: QueueItem[] }) {
    const workflows: {
      videoName: string;
      status: "completed" | "failed" | "blocked" | "in-progress";
      statusDescription: string;
      steps: Array<{
        name: string;
        status: "completed" | "failed" | "blocked" | "pending";
      }>;
    }[] = [];

    // Group queue items by video (using transcript path or video name)
    const videoGroups = new Map<string, QueueItem[]>();

    for (const item of queueState.queue) {
      let videoKey = "";

      if (item.action.type === "create-auto-edited-video") {
        videoKey = item.action.videoName;
      } else if (
        item.action.type === "analyze-transcript-for-links" ||
        item.action.type === "generate-article-from-transcript"
      ) {
        videoKey =
          (item.action as any).transcriptPath
            .split("/")
            .pop()
            ?.replace(".txt", "") || "Unknown";
      }

      if (videoKey) {
        if (!videoGroups.has(videoKey)) {
          videoGroups.set(videoKey, []);
        }
        videoGroups.get(videoKey)!.push(item);
      }
    }

    // Analyze each video's workflow
    for (const [videoName, items] of videoGroups) {
      // Check if this is an article generation workflow (has article generation step)
      const hasArticleGeneration = items.some(
        (item: QueueItem) =>
          item.action.type === "generate-article-from-transcript"
      );

      if (!hasArticleGeneration) continue;

      const stepOrder = [
        "create-auto-edited-video",
        "analyze-transcript-for-links",
        "links-request",
        "generate-article-from-transcript",
      ];

      const steps = stepOrder.map((stepType) => {
        const item = items.find((i: QueueItem) => i.action.type === stepType);
        const stepNames = {
          "create-auto-edited-video": "Video Creation",
          "analyze-transcript-for-links": "Analysis",
          "links-request": "Links",
          "generate-article-from-transcript": "Article",
        };

        return {
          name: stepNames[stepType as keyof typeof stepNames] || stepType,
          status: !item
            ? ("pending" as const)
            : item.status === "completed"
              ? ("completed" as const)
              : item.status === "failed"
                ? ("failed" as const)
                : item.status === "requires-user-input"
                  ? ("blocked" as const)
                  : ("pending" as const),
        };
      });

      // Determine overall workflow status
      const failedSteps = steps.filter((s) => s.status === "failed");
      const blockedSteps = steps.filter((s) => s.status === "blocked");
      const completedSteps = steps.filter((s) => s.status === "completed");

      let status: "completed" | "failed" | "blocked" | "in-progress";
      let statusDescription: string;

      if (failedSteps.length > 0) {
        status = "failed";
        statusDescription = `Failed at ${failedSteps[0]!.name}`;
      } else if (completedSteps.length === steps.length) {
        status = "completed";
        statusDescription = "Article generation complete";
      } else if (blockedSteps.length > 0) {
        status = "blocked";
        statusDescription = `Waiting for user input: ${blockedSteps.map((s) => s.name).join(", ")}`;
      } else {
        status = "in-progress";
        const nextStep = steps.find((s) => s.status === "pending");
        statusDescription = nextStep
          ? `Processing ${nextStep.name}...`
          : "In progress";
      }

      workflows.push({
        videoName,
        status,
        statusDescription,
        steps,
      });
    }

    return workflows;
  }
);

// Generate a visual progress bar for workflow steps
function generateProgressBar(
  steps: Array<{ name: string; status: string }>
): string {
  const icons = steps.map((step) => {
    switch (step.status) {
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      case "blocked":
        return "❓";
      default:
        return "⏳";
    }
  });

  const names = steps.map((s) => s.name);
  return names.map((name, i) => `${icons[i]} ${name}`).join(" → ");
}

// Exercise Organizer Command
program
  .command("exercise-organizer [directory]")
  .aliases(["eo", "exercises"])
  .description("Analyze and organize TypeScript exercise files")
  .option("-v, --validate", "Validate exercises and exit with status code")
  .option("--format <type>", "Output format: table, json, markdown", "table")
  .option("--verbose", "Enable verbose output")
  .action(
    async (
      directory: string | undefined,
      options: ExerciseOrganizerOptions
    ) => {
      const result = await runExerciseOrganizer(directory, options).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(NodeFileSystem.layer),
        Effect.runPromise
      );

      // Exit with non-zero code if there are errors (useful for CI)
      if (options.validate && result.hasErrors) {
        process.exit(1);
      }
    }
  );

// Add database dump error classes
export class DatabaseUrlParseError extends Data.TaggedError(
  "DatabaseUrlParseError"
)<{
  url: string;
  cause: Error;
}> {}

export class DatabaseDumpError extends Data.TaggedError("DatabaseDumpError")<{
  cause: Error;
  command: string;
}> {}

// Database dump functionality
const parseDatabaseUrl = Effect.fn("parseDatabaseUrl")(function* (
  databaseUrl: string
) {
  const url = yield* Effect.try({
    try: () => new URL(databaseUrl),
    catch: (error) =>
      new DatabaseUrlParseError({
        url: databaseUrl,
        cause: error as Error,
      }),
  });

  if (url.protocol !== "postgresql:") {
    return yield* Effect.fail(
      new DatabaseUrlParseError({
        url: databaseUrl,
        cause: new Error("Only PostgreSQL URLs are supported"),
      })
    );
  }

  return {
    host: url.hostname,
    port: url.port || "5432",
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
  };
});

const dumpDatabase = Effect.fn("dumpDatabase")(function* () {
  const databaseUrl = yield* Config.string("WRITTEN_CONTENT_DATABASE_URL");
  const backupFilePath = yield* Config.string(
    "WRITTEN_CONTENT_DB_BACKUP_FILE_PATH"
  );

  // Parse database URL
  const dbConfig = yield* parseDatabaseUrl(databaseUrl);

  // Build pg_dump command
  const pgDumpCommand = [
    "pg_dump",
    "-h",
    dbConfig.host,
    "-p",
    dbConfig.port,
    "-U",
    dbConfig.username,
    "-d",
    dbConfig.database,
    "-Fc", // Custom format (compressed)
    ">",
    backupFilePath,
  ].join(" ");

  yield* Effect.logInfo("Starting database dump", {
    host: dbConfig.host,
    database: dbConfig.database,
    outputFile: backupFilePath,
  });

  // Set PGPASSWORD environment variable for pg_dump
  const env = { ...process.env, PGPASSWORD: dbConfig.password };

  // Execute pg_dump command
  yield* execAsync(pgDumpCommand, { env }).pipe(
    Effect.mapError(
      (error) =>
        new DatabaseDumpError({
          cause: error,
          command: pgDumpCommand,
        })
    )
  );

  yield* Effect.logInfo("Database dump completed successfully", {
    outputFile: backupFilePath,
  });

  return backupFilePath;
});

program
  .command("dump-database")
  .description("Dump a remote PostgreSQL database to a file using pg_dump")
  .action(async () => {
    await dumpDatabase().pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(OpenTelemetryLive),
      Effect.withSpan("dump-database"),
      Effect.runPromise
    );
  });

program.parse(process.argv);
