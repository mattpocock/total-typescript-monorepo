import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive, OBSIntegrationService } from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Console, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program.command("log-latest-obs-video").action(async () => {
    await Effect.gen(function* () {
      const obs = yield* OBSIntegrationService;
      const inputVideo = yield* obs.getLatestOBSVideo();
      yield* Console.log(inputVideo);
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      NodeRuntime.runMain,
    );
  });
}
