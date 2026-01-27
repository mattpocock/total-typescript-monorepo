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
    .command("move-interview-to-davinci-resolve <hostVideo> <guestVideo>")
    .action(async (hostVideo, guestVideo) => {
      await Effect.gen(function* () {
        const workflows = yield* WorkflowsService;

        const fullHostPath = path.resolve(
          process.cwd(),
          hostVideo,
        ) as AbsolutePath;
        const fullGuestPath = path.resolve(
          process.cwd(),
          guestVideo,
        ) as AbsolutePath;

        yield* workflows.moveInterviewToDavinciResolve({
          hostVideo: fullHostPath,
          guestVideo: fullGuestPath,
        });
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
