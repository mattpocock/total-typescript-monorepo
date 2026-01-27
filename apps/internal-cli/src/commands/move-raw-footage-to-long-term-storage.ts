import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  moveRawFootageToLongTermStorage,
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
    .command("move-raw-footage-to-long-term-storage")
    .description("Move raw footage to long term storage.")
    .action(async () => {
      await moveRawFootageToLongTermStorage().pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
