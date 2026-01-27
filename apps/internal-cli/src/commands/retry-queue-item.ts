import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive } from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Console, Effect, Layer } from "effect";
import { QueueUpdaterService } from "../../../../packages/ffmpeg/dist/queue/queue-updater-service.js";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
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
}
