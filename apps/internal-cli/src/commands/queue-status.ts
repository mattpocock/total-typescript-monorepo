import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  QueueUpdaterService,
  type QueueItem,
} from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Console, Effect, Layer } from "effect";
import { styleText } from "node:util";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

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

export function register(program: Command): void {
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
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
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
            } else if (
              item.action.type === "generate-article-from-transcript"
            ) {
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
                linksDep?.status === "completed"
                  ? "✓ Links"
                  : "⏳ Links pending";

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
}
