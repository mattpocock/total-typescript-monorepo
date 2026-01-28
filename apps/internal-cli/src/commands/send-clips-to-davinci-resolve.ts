import { NodeRuntime } from "@effect/platform-node";
import {
  AppLayerLive,
  AUTO_EDITED_VIDEO_FINAL_END_PADDING,
  FFmpegCommandsService,
  serializeMultiTrackClipsForAppendScript,
} from "@total-typescript/ffmpeg";
import {
  runDavinciResolveScript,
  type AbsolutePath,
} from "@total-typescript/shared";
import type { Command } from "commander";
import { ConfigProvider, Console, Data, Effect, Layer, Schema } from "effect";
import { clipsSchema } from "../shared/schemas.js";
import { OpenTelemetryLive } from "../tracing.js";

/**
 * Main Layer that combines the application layer with OpenTelemetry tracing
 */
const MainLayerLive = Layer.merge(AppLayerLive, OpenTelemetryLive);

class NoInputVideosError extends Data.TaggedError("NoInputVideosError")<{}> {}

export function register(program: Command): void {
  program
    .command("send-clips-to-davinci-resolve <clips> <timeline-name>")
    .action(async (clips, timelineName) => {
      await Effect.gen(function* () {
        const clipsParsed = yield* Schema.decodeUnknown(clipsSchema)(
          JSON.parse(clips),
        );

        const ffmpeg = yield* FFmpegCommandsService;

        const uniqueInputVideos = [
          ...new Set(clipsParsed.map((clip) => clip.inputVideo)),
        ];

        const inputVideosMap = uniqueInputVideos.reduce(
          (acc, video, index) => {
            acc[video] = index;
            return acc;
          },
          {} as Record<string, number>,
        );

        const firstInputVideo = uniqueInputVideos[0];

        if (!firstInputVideo) {
          return yield* Effect.fail(new NoInputVideosError());
        }

        const fps = yield* ffmpeg.getFPS(firstInputVideo as AbsolutePath);

        yield* Console.log(fps, timelineName);

        const result = yield* runDavinciResolveScript("clip-and-append.lua", {
          NEW_TIMELINE_NAME: timelineName,
          INPUT_VIDEOS: uniqueInputVideos.join(":::"),
          CLIPS_TO_APPEND: serializeMultiTrackClipsForAppendScript(
            clipsParsed.map((clip, index, array) => {
              const isLastClip = index === array.length - 1;

              const endPadding = isLastClip
                ? AUTO_EDITED_VIDEO_FINAL_END_PADDING
                : 0;
              return {
                startFrame: Math.floor(clip.startTime * fps),
                endFrame: Math.ceil(
                  (clip.startTime + clip.duration + endPadding) * fps,
                ),
                videoIndex: inputVideosMap[clip.inputVideo]!,
                trackIndex: 1,
              };
            }),
          ),
          WSLENV: "INPUT_VIDEOS/p:CLIPS_TO_APPEND:NEW_TIMELINE_NAME",
        });

        yield* Console.log(result.stdout);
        yield* Console.log(result.stderr);
      }).pipe(
        Effect.withConfigProvider(ConfigProvider.fromEnv()),
        Effect.scoped,
        Effect.provide(MainLayerLive),
        NodeRuntime.runMain,
      );
    });
}
