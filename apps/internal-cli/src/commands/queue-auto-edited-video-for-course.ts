import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive } from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import { QueueUpdaterService } from "../../../../packages/ffmpeg/dist/queue/queue-updater-service.js";
import { OBSIntegrationService } from "../../../../packages/ffmpeg/dist/services.js";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
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
}
