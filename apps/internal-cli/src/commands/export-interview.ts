import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive, WorkflowsService } from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import type { Command } from "commander";
import { ConfigProvider, Effect, Layer } from "effect";
import path from "node:path";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program
    .command("export-interview <hostVideo> <guestVideo> <outputJsonPath>")
    .action(async (hostVideo, guestVideo, outputJsonPath) => {
      await Effect.gen(function* () {
        const workflows = yield* WorkflowsService;

        yield* workflows.exportInterviewWorkflow({
          hostVideo: path.join(process.cwd(), hostVideo) as AbsolutePath,
          guestVideo: path.join(process.cwd(), guestVideo) as AbsolutePath,
          outputJsonPath: path.join(
            process.cwd(),
            outputJsonPath,
          ) as AbsolutePath,
        });
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
