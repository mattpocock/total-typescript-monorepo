#!/usr/bin/env node

import { FileSystem } from "@effect/platform";
import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  generateArticleFromTranscript,
  getOutstandingInformationRequests,
  multiSelectVideosFromQueue,
  processInformationRequests,
  processQueue,
  type QueueItem,
  transcribeVideoWorkflow,
  validateWindowsFilename,
} from "@total-typescript/ffmpeg";
import { Command } from "commander";
import { config } from "dotenv";
import { Config, ConfigProvider, Console, Effect, Layer } from "effect";
import path from "node:path";
import { styleText } from "node:util";
import { QueueUpdaterService } from "../../../packages/ffmpeg/dist/queue/queue-updater-service.js";
import {
  AIService,
  AskQuestionService,
  OBSIntegrationService,
  TranscriptStorageService,
} from "../../../packages/ffmpeg/dist/services.js";
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

program.command("log-latest-obs-video").action(async () => {
  await Effect.gen(function* () {
    const obs = yield* OBSIntegrationService;
    const inputVideo = yield* obs.getLatestOBSVideo();
    yield* Console.log(inputVideo);
  }).pipe(
    Effect.withConfigProvider(ConfigProvider.fromEnv()),
    Effect.provide(MainLayerLive),
    NodeRuntime.runMain,
  );
});

program
  .command("queue-auto-edited-video-for-course <id>")
  .action(async (id: string) => {
    await Effect.gen(function* () {
      const queueUpdater = yield* QueueUpdaterService;
      const obs = yield* OBSIntegrationService;
      const inputVideo = yield* obs.getLatestOBSVideo();

      yield* queueUpdater.writeToQueue([
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
      NodeRuntime.runMain,
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
      NodeRuntime.runMain,
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
      NodeRuntime.runMain,
    );
  });

program
  .command("process-information-requests")
  .aliases(["pir", "info-requests"])
  .description(
    "Check for and process outstanding information requests in the queue.",
  )
  .action(async () => {
    await Effect.gen(function* () {
      const informationRequests = yield* getOutstandingInformationRequests();

      if (informationRequests.length === 0) {
        yield* Console.log("No outstanding information requests found.");
        return;
      }

      yield* Console.log(
        `Found ${informationRequests.length} outstanding information request(s).`,
      );
      yield* processInformationRequests();
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      NodeRuntime.runMain,
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
      const transcripts = yield* transcriptStorage.getSubtitleFiles();
      const fs = yield* FileSystem.FileSystem;

      const transcriptPath = yield* askQuestion.select(
        "Select a transcript",
        transcripts.map((p) => ({
          title: path.basename(p),
          value: p,
        })),
      );

      let code: string | undefined;

      const codePath = yield* askQuestion.askQuestion(
        "Enter the file path containing any code for the article (optional)",
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
      NodeRuntime.runMain,
    );
  });

program
  .command("queue-status")
  .aliases(["qs", "status"])
  .description("Show the status of the render queue.")
  .action(async () => {
    await Effect.gen(function* () {
      const queueUpdater = yield* QueueUpdaterService;
      const queueState = yield* queueUpdater.getQueueState();

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
            completedDate.getDate(),
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
        (q: QueueItem) => q.status !== "completed",
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
              (q: QueueItem) => q.id === articleAction.linksDependencyId,
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
              "\n",
          );
        });
      });

      // Add workflow summary for article generation
      const articleWorkflows = yield* analyzeArticleWorkflows(queueState);
      if (articleWorkflows.length > 0) {
        yield* Console.log(
          styleText("bold", "\n📚 Article Generation Workflows:"),
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
                `  ${styleText("dim", "Status")}     ${workflow.statusDescription}\n`,
            );
          });
        });
        yield* Console.log("");
      }

      if (uncompleted.length === 0) {
        yield* Console.log("✅ All outstanding queue items are completed!");
      } else {
        yield* Console.log(
          `⏳ There are ${uncompleted.length} outstanding item(s) in the queue.`,
        );

        // Show information request summary
        const infoRequests = uncompleted.filter(
          (item: QueueItem) => item.status === "requires-user-input",
        );
        if (infoRequests.length > 0) {
          yield* Console.log(
            `❓ ${infoRequests.length} item(s) require user input. Run: ${styleText("bold", "pnpm cli pir")}`,
          );
        }
      }
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      Effect.withSpan("queue-status"),
      NodeRuntime.runMain,
    );
  });

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
          item.action.type === "generate-article-from-transcript",
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
  },
);

// Generate a visual progress bar for workflow steps
function generateProgressBar(
  steps: Array<{ name: string; status: string }>,
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
