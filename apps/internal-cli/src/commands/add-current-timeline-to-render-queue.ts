import { NodeRuntime } from "@effect/platform-node";
import {
  addCurrentTimelineToRenderQueue,
  AppLayerLive,
} from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program
    .command("add-current-timeline-to-render-queue")
    .description("Add the current timeline to the render queue.")
    .action(async () => {
      await addCurrentTimelineToRenderQueue().pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
