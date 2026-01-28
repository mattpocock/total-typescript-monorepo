import { FileSystem } from "@effect/platform";
import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  OBSIntegrationService,
  WorkflowsService,
} from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import type { Command } from "commander";
import {
  ConfigProvider,
  Console,
  Data,
  Effect,
  Layer,
  Logger,
  LogLevel,
} from "effect";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

class FileDoesNotExistError extends Data.TaggedError("FileDoesNotExistError")<{
  filePath: AbsolutePath;
}> {}

export function register(program: Command): void {
  program
    .command("get-clips-from-latest-video [filePath]")
    .option("-s, --startTime <startTime>", "Start time of the video")
    .action(async (filePath, { startTime }) => {
      Effect.gen(function* () {
        const workflows = yield* WorkflowsService;
        const obs = yield* OBSIntegrationService;
        const fs = yield* FileSystem.FileSystem;

        let latestVideo: AbsolutePath;

        if (filePath) {
          const exists = yield* fs.exists(filePath);
          if (!exists) {
            yield* Effect.fail(new FileDoesNotExistError({ filePath }));
          }
          latestVideo = filePath;
        } else {
          latestVideo = yield* obs.getLatestOBSVideo();
        }

        const clips = yield* workflows.findClips({
          inputVideo: latestVideo,
          mode: "part-of-video",
          startTime: startTime ? Number(startTime) : undefined,
        });

        const output = {
          clips: clips.map((clip) => {
            return {
              startTime: Number(clip.startTime.toFixed(2)),
              endTime: Number((clip.startTime + clip.duration).toFixed(2)),
              inputVideo: latestVideo,
            };
          }),
        };

        yield* Console.log(JSON.stringify(output));
      }).pipe(
        Logger.withMinimumLogLevel(LogLevel.Fatal),
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.provide(MainLayerLive),
        Effect.scoped,
        NodeRuntime.runMain,
      );
    });
}
