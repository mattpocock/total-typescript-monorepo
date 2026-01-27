import { NodeRuntime } from "@effect/platform-node";
import { AppLayerLive, WorkflowsService } from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import type { Command } from "commander";
import {
  ConfigProvider,
  Console,
  Effect,
  Layer,
  Logger,
  LogLevel,
  Schema,
} from "effect";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

const transcribeClipSchema = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    startTime: Schema.Number,
    duration: Schema.Number,
    inputVideo: Schema.String,
  }),
);

export function register(program: Command): void {
  program.command("transcribe-clips <json>").action(async (json) => {
    await Effect.gen(function* () {
      const workflows = yield* WorkflowsService;
      const clips = yield* Schema.decodeUnknown(transcribeClipSchema)(
        JSON.parse(json),
      );

      const result = yield* workflows.getSubtitlesForClips({
        clips: clips.map((clip) => {
          return {
            inputVideo: clip.inputVideo as AbsolutePath,
            startTime: clip.startTime,
            duration: clip.duration,
            beatType: "none",
          };
        }),
      });

      const toReturn = result.clips.map((clip, index) => {
        return {
          segments: clip.segments,
          words: clip.words,
          id: clips[index]!.id,
        };
      });

      yield* Console.log(JSON.stringify(toReturn));
    }).pipe(
      Logger.withMinimumLogLevel(LogLevel.Fatal),
      Effect.withConfigProvider(ConfigProvider.fromEnv()),
      Effect.provide(MainLayerLive),
      Effect.scoped,
      NodeRuntime.runMain,
    );
  });
}
