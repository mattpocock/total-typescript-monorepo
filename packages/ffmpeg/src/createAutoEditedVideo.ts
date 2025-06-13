import { FileSystem } from "@effect/platform/FileSystem";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { Effect } from "effect";
import { tmpdir } from "os";
import { join } from "path";
import {
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
  AUTO_EDITED_VIDEO_FINAL_END_PADDING,
  SILENCE_DURATION,
  THRESHOLD,
} from "./constants.js";
import {
  extractBadTakeMarkersFromFile,
  isBadTake,
} from "./extractChaptersFromFile.js";
import { findSilenceInVideo } from "./functions.js";
import { getFPS } from "./getFPS.js";

export class CouldNotCreateSpeakingOnlyVideoError extends Error {
  readonly _tag = "CouldNotCreateSpeakingOnlyVideoError";
  override message = "Could not create speaking-only video.";
}

export class FFMPegWithComplexFilterError extends Error {
  readonly _tag = "FFMPegWithComplexFilterError";
  override message = "FFMPEG with complex filter failed.";
  readonly stdout: string | undefined;
  readonly stderr: string | undefined;
  constructor(opts: {
    stdout: string | undefined;
    stderr: string | undefined;
  }) {
    super();
    this.stdout = opts.stdout;
    this.stderr = opts.stderr;
  }
}

const FFMPEG_CONCURRENCY_LIMIT = 6;

export const createAutoEditedVideo = ({
  inputVideo,
  outputVideo,
}: {
  inputVideo: AbsolutePath;
  outputVideo: AbsolutePath;
}) => {
  return Effect.gen(function* () {
    const startTime = Date.now();

    const console = yield* Effect.console;

    yield* console.log("🎥 Processing video:", inputVideo);
    yield* console.log("📝 Output will be saved to:", outputVideo);

    // Get the video's FPS
    yield* console.log("⏱️  Detecting video FPS...");
    const fpsStart = Date.now();
    const fps = yield* getFPS(inputVideo);
    console.log(
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
      return Effect.fail(new CouldNotCreateSpeakingOnlyVideoError());
    }

    // Create a temporary directory for clips
    const tempDir = join(tmpdir(), `speaking-clips-${Date.now()}`);
    yield* execAsync(`mkdir -p "${tempDir}"`);

    // Create individual clips
    yield* console.log("🎬 Creating individual clips...");
    const clipsStart = Date.now();
    const clipFiles = yield* Effect.all(
      goodClips.map((clip, i) =>
        Effect.gen(function* () {
          const clipStart = Date.now();
          const outputFile = join(tempDir, `clip-${i}.mp4`);
          const duration =
            i === goodClips.length - 1
              ? clip.duration + AUTO_EDITED_VIDEO_FINAL_END_PADDING
              : clip.duration;

          yield* execAsync(
            `nice -n 19 ffmpeg -y -hide_banner -ss ${clip.startTime} -i "${inputVideo}" -t ${duration} -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputFile}"`
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
    yield* execAsync(
      `nice -n 19 ffmpeg -y -hide_banner -f concat -safe 0 -i "${concatFile}" -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputVideo}"`
    );
    yield* console.log(
      `✅ Concatenated all clips (took ${(Date.now() - concatStart) / 1000}s)`
    );

    // Clean up temporary files
    yield* execAsync(`rm -rf "${tempDir}"`);

    const totalTime = (Date.now() - startTime) / 1000;
    yield* console.log(
      `✅ Successfully created speaking-only video! (Total time: ${totalTime}s)`
    );

    return Effect.succeed(void 0);
  });
};
