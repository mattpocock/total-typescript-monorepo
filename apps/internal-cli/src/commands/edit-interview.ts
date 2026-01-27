import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive, WorkflowsService } from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program
    .command("edit-interview <hostVideo> <guestVideo> <outputPath>")
    .action(async (hostVideo, guestVideo, outputPath) => {
      await Effect.gen(function* () {
        const workflows = yield* WorkflowsService;

        yield* workflows.editInterviewWorkflow({
          hostVideo,
          guestVideo,
          outputPath,
        });
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        Effect.scoped,
        NodeRuntime.runMain,
      );
    });
}
