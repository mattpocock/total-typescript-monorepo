import { NodeRuntime } from "@effect/platform-node";
import { appendVideoToTimeline, AppLayerLive } from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import type { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(parent: Command): void {
  parent
    .command("append-video [video]")
    .description("Append video to the current Davinci Resolve timeline")
    .action(async (video: string | undefined) => {
      await appendVideoToTimeline({
        inputVideo: video as AbsolutePath,
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
