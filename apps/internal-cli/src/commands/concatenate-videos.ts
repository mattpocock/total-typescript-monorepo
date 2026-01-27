import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  multiSelectVideosFromQueue,
  validateWindowsFilename,
} from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Console, Effect, Layer } from "effect";
import { QueueUpdaterService } from "../../../../packages/ffmpeg/dist/queue/queue-updater-service.js";
import { AskQuestionService } from "../../../../packages/ffmpeg/dist/services.js";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
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
}
