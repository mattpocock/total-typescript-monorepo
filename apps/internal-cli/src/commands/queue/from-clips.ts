import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive, QueueUpdaterService } from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import type { Command } from "commander";
import { ConfigProvider, Console, Effect, Layer, Schema } from "effect";
import { clipsSchema } from "../../shared/schemas.js";
import { OpenTelemetryLive } from "../../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(parent: Command): void {
  parent
    .command("from-clips <clips> <outputVideoName> [shortsDirectoryOutputName]")
    .description("Queue video creation from JSON clip definitions")
    .action(async (clips, outputVideoName, shortsDirectoryOutputName) => {
      await Effect.gen(function* () {
        const queueUpdater = yield* QueueUpdaterService;

        const clipsParsed = yield* Schema.decodeUnknown(clipsSchema)(
          JSON.parse(clips),
        );

        yield* queueUpdater.writeToQueue([
          {
            id: crypto.randomUUID(),
            action: {
              type: "create-video-from-clips",
              clips: clipsParsed.map((clip) => {
                return {
                  inputVideo: clip.inputVideo as AbsolutePath,
                  startTime: clip.startTime,
                  duration: clip.duration,
                  beatType: clip.beatType,
                };
              }),
              outputVideoName,
              shortsDirectoryOutputName: shortsDirectoryOutputName || undefined,
            },
            createdAt: Date.now(),
            status: "ready-to-run",
          },
        ]);

        yield* Console.log("Added video creation job to queue.");
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.scoped,
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
