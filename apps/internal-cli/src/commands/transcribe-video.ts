import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  transcribeVideoWorkflow,
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
}
