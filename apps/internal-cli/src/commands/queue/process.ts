import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive, processQueue } from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(parent: Command): void {
  parent
    .command("process")
    .description("Run all pending queue items")
    .action(async () => {
      await processQueue().pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        Effect.scoped,
        NodeRuntime.runMain,
      );
    });
}
