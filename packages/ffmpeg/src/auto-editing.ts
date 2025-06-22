import { FileSystem } from "@effect/platform/FileSystem";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { Console, Data, Effect } from "effect";
import { tmpdir } from "os";
import { join } from "path";
import {
  extractBadTakeMarkersFromFile,
  isBadTake,
} from "./chapter-extraction.js";
import {
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
  AUTO_EDITED_VIDEO_FINAL_END_PADDING,
  SILENCE_DURATION,
  THRESHOLD,
} from "./constants.js";
import { FFmpegCommandsService } from "./services.js";
import { findSilenceInVideo } from "./silence-detection.js";

export const CouldNotCreateSpeakingOnlyVideoError = Data.TaggedError(
  "CouldNotCreateSpeakingOnlyVideoError"
)<{
  cause: Error;
}>;

export const FFMPegWithComplexFilterError = Data.TaggedError(
  "FFMPegWithComplexFilterError"
)<{
  stdout: string | undefined;
  stderr: string | undefined;
}>;

const FFMPEG_CONCURRENCY_LIMIT = 6;

export const createAutoEditedVideo = ({
  inputVideo,
  outputVideo,
}: {
  inputVideo: AbsolutePath;
  outputVideo: AbsolutePath;
}) => {
  return Effect.gen(function* () {
    const console = yield* Console.Console;
    const startTime = Date.now();
    yield* console.log("🎥 Processing video:", inputVideo);
    yield* console.log("📝 Output will be saved to:", outputVideo);

    // Get the video's FPS
    yield* console.log("⏱️  Detecting video FPS...");
    const fpsStart = Date.now();
    const ffmpeg = yield* FFmpegCommandsService;
    const fps = yield* ffmpeg.getFPS(inputVideo);
    yield* console.log(
      `✅ Detected FPS: ${fps} (took ${(Date.now() - fpsStart) / 1000}s)`
    );

    // First, find all speaking clips
    yield* console.log("🔍 Finding speaking clips...");
    const speakingStart = Date.now();
    const { speakingClips } = yield* findSilenceInVideo(inputVideo, {
      threshold: THRESHOLD,
      silenceDuration: SILENCE_DURATION,
      startPadding: AUTO_EDITED_START_PADDING,
      endPadding: AUTO_EDITED_END_PADDING,
      fps,
    });
    yield* console.log(
      `✅ Found ${speakingClips.length} speaking clips (took ${(Date.now() - speakingStart) / 1000}s)`
    );

    // Then get all bad take markers
    yield* console.log("🎯 Extracting bad take markers...");
    const markersStart = Date.now();
    const badTakeMarkers = yield* extractBadTakeMarkersFromFile(
      inputVideo,
      fps
    );
    yield* console.log(
      `✅ Found ${badTakeMarkers.length} bad take markers (took ${(Date.now() - markersStart) / 1000}s)`
    );

    // Filter out bad takes
    yield* console.log("🔍 Filtering out bad takes...");
    const filterStart = Date.now();
    const goodClips = speakingClips.filter((clip, index) => {
      const quality = isBadTake(
        clip,
        badTakeMarkers,
        index,
        speakingClips,
        fps
      );
      return quality === "good";
    });
    yield* console.log(
      `✅ Found ${goodClips.length} good clips (took ${(Date.now() - filterStart) / 1000}s)`
    );

    if (goodClips.length === 0) {
      yield* console.log("❌ No good clips found");
      return yield* Effect.fail(
        new CouldNotCreateSpeakingOnlyVideoError({
          cause: new Error("No good clips found"),
        })
      );
    }

    const clips = goodClips.map((clip, i, clips) => {
      const resolvedDuration = roundToDecimalPlaces(
        clip.durationInFrames / fps,
        2
      );
      const duration =
        i === clips.length - 1
          ? resolvedDuration +
            AUTO_EDITED_VIDEO_FINAL_END_PADDING -
            AUTO_EDITED_END_PADDING
          : resolvedDuration;
      return {
        startTime: clip.startTime,
        duration,
      };
    });

    // Create a temporary directory for clips
    const tempDir = join(tmpdir(), `speaking-clips-${Date.now()}`);
    yield* execAsync(`mkdir -p "${tempDir}"`);

    // Create individual clips
    yield* console.log("🎬 Creating individual clips...");
    const clipsStart = Date.now();
    const clipFiles = yield* Effect.all(
      clips.map((clip, i) =>
        Effect.gen(function* () {
          const ffmpeg = yield* FFmpegCommandsService;
          const clipStart = Date.now();
          const outputFile = join(tempDir, `clip-${i}.mp4`) as AbsolutePath;

          yield* ffmpeg.createClip(
            inputVideo,
            outputFile,
            clip.startTime,
            clip.duration
          );

          yield* console.log(
            `✅ Created clip ${i + 1}/${goodClips.length} (took ${(Date.now() - clipStart) / 1000}s)`
          );
          return outputFile;
        })
      ),
      {
        concurrency: FFMPEG_CONCURRENCY_LIMIT,
      }
    );
    yield* console.log(
      `✅ Created all ${goodClips.length} clips (took ${(Date.now() - clipsStart) / 1000}s)`
    );

    // Create a concat file
    const concatFile = join(tempDir, "concat.txt") as AbsolutePath;
    const concatContent = clipFiles
      .map((file: string) => `file '${file}'`)
      .join("\n");

    const fs = yield* FileSystem;
    yield* fs.writeFileString(concatFile, concatContent);

    // Concatenate all clips
    yield* console.log("🎥 Concatenating clips...");
    const concatStart = Date.now();
    yield* ffmpeg.concatenateClips(concatFile, outputVideo);
    yield* console.log(
      `✅ Concatenated all clips (took ${(Date.now() - concatStart) / 1000}s)`
    );

    // Clean up temporary files
    yield* fs.remove(tempDir, { recursive: true, force: true });

    const totalTime = (Date.now() - startTime) / 1000;
    yield* console.log(
      `✅ Successfully created speaking-only video! (Total time: ${totalTime}s)`
    );
    return { speakingClips: clips };
  });
};

const roundToDecimalPlaces = (num: number, places: number) => {
  return Math.round(num * 10 ** places) / 10 ** places;
};
