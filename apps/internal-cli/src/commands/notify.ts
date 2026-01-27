import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive } from "@total-typescript/ffmpeg";
import type { Command } from "commander";
import { Config, ConfigProvider, Console, Effect, Layer } from "effect";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

export function register(program: Command): void {
  program
    .command("notify <text>")
    .description("Send a notification to the Zapier webhook")
    .action(async (text: string) => {
      await Effect.gen(function* () {
        const webhookUrl = yield* Config.string("ZAPIER_NOTIFICATION_WEBHOOK");

        yield* Effect.tryPromise({
          try: () =>
            fetch(webhookUrl, {
              method: "POST",
              body: text,
            }),
          catch: (error) => new Error(`Failed to send notification: ${error}`),
        });

        yield* Console.log("Notification sent");
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
