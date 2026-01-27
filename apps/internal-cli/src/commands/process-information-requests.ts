import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  getOutstandingInformationRequests,
  processInformationRequests,
} from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { ConfigProvider, Console, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program
    .command("process-information-requests")
    .aliases(["pir", "info-requests"])
    .description(
      "Check for and process outstanding information requests in the queue.",
    )
    .action(async () => {
      await Effect.gen(function* () {
        const informationRequests = yield* getOutstandingInformationRequests();

        if (informationRequests.length === 0) {
          yield* Console.log("No outstanding information requests found.");
          return;
        }

        yield* Console.log(
          `Found ${informationRequests.length} outstanding information request(s).`,
        );
        yield* processInformationRequests();
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
