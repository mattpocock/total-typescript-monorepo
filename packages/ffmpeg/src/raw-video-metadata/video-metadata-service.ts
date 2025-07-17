import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { type AbsolutePath } from "@total-typescript/shared";
import { Config, Effect } from "effect";
import path from "node:path";
import { FFmpegCommandsService } from "../ffmpeg-commands.js";
import {
  extractBadTakeMarkersFromFile,
  isBadTake,
} from "../chapter-extraction.js";
import { findSilenceInVideo } from "../silence-detection.js";
import {
  FFMPEG_CONCURRENCY_LIMIT,
  SILENCE_DURATION,
  THRESHOLD,
  TRANSCRIPTION_CONCURRENCY_LIMIT,
} from "../constants.js";
import {
  RawVideoMetadataDTO,
  type RawVideoMetadata,
} from "./raw-video-metadata-types.js";
import { tmpdir } from "node:os";

export class VideoMetadataService extends Effect.Service<VideoMetadataService>()(
  "VideoMetadataService",
  {
    effect: Effect.gen(function* () {
      const ffmpeg = yield* FFmpegCommandsService;
      const fs = yield* FileSystem.FileSystem;
      const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");

      const createVideoMetadata = Effect.fn("createVideoMetadata")(function* (
        rawVideoPath: AbsolutePath
      ) {
        const fpsFork = yield* Effect.fork(ffmpeg.getFPS(rawVideoPath));

        const tmpDir = yield* fs.makeTempDirectoryScoped({
          directory: tmpdir(),
          prefix: "speaking-clips",
        });

        const fullAudioPath = path.join(
          tmpDir,
          `full-audio.mp3`
        ) as AbsolutePath;

        const subtitlesFork = yield* Effect.fork(
          Effect.gen(function* () {
            yield* ffmpeg.extractAudioFromVideo(rawVideoPath, fullAudioPath);

            return yield* ffmpeg.createSubtitleFromAudio(fullAudioPath);
          })
        );

        const resolutionFork = yield* Effect.fork(
          ffmpeg.getResolution(rawVideoPath).pipe(
            Effect.map((resolution) => {
              return {
                widthInPixels: resolution.width,
                heightInPixels: resolution.height,
              };
            })
          )
        );

        const badTakeMarkersFork = yield* Effect.fork(
          extractBadTakeMarkersFromFile(rawVideoPath, yield* fpsFork, ffmpeg)
        );

        const fps = yield* fpsFork;

        const { speakingClips } = yield* findSilenceInVideo(rawVideoPath, {
          threshold: THRESHOLD,
          silenceDuration: SILENCE_DURATION,
          startPadding: 0,
          endPadding: 0,
          fps,
          ffmpeg,
        });

        const badTakeMarkers = yield* badTakeMarkersFork;

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

        const relativeVideoPath = path.relative(
          obsOutputDirectory,
          rawVideoPath
        );

        const subtitles = yield* subtitlesFork;

        let subtitleWords = subtitles.words;

        const metadata: RawVideoMetadata = {
          id: crypto.randomUUID(),
          videoPath: relativeVideoPath,
          fps: yield* fpsFork,
          resolution: yield* resolutionFork,
          clips: goodClips.map((segment) => {
            const startWordIndex = 0;

            // Find the last word that ends within or before the clip end time
            let endWordIndex = subtitleWords.findLastIndex((word) => {
              return word.end <= segment.endTime;
            });

            // If the end word index is -1, it means that the last word is after
            // the clip end time, so we need to use the last word
            if (endWordIndex === -1) {
              endWordIndex = subtitleWords.length - 1;
            }

            // Extract words for this clip
            const clipWords = subtitleWords.slice(
              startWordIndex,
              endWordIndex + 1
            );

            // Create transcript by joining the words
            const transcript = clipWords.map((word) => word.text).join(" ");

            // Remove the used words from the original array to avoid duplicates
            subtitleWords.splice(
              startWordIndex,
              endWordIndex - startWordIndex + 1
            );

            return {
              id: crypto.randomUUID(),
              videoPath: relativeVideoPath,
              startTimeInSeconds: segment.startTime,
              endTimeInSeconds: segment.endTime,
              transcript,
              deleted: false,
            };
          }),
        };

        return new RawVideoMetadataDTO(metadata);
      }, Effect.scoped);

      const getMetadataPath = (videoPath: AbsolutePath) => {
        const parsed = path.parse(videoPath);
        return path.join(
          parsed.dir,
          parsed.name + ".metadata.json"
        ) as AbsolutePath;
      };

      const getVideoMetadata = Effect.fn("getVideoMetadata")(function* (opts: {
        videoPath: AbsolutePath;
      }) {
        const metadataPath = getMetadataPath(opts.videoPath);

        const exists = yield* fs.exists(metadataPath);
        if (!exists) {
          const metadataDTO = yield* createVideoMetadata(opts.videoPath);
          yield* fs.writeFileString(
            metadataPath,
            JSON.stringify(metadataDTO.metadata, null, 2)
          );
          return metadataDTO;
        }

        return new RawVideoMetadataDTO(
          JSON.parse(yield* fs.readFileString(metadataPath)) as RawVideoMetadata
        );
      });

      return {
        createVideoMetadata,
        getVideoMetadata,
      };
    }),
    dependencies: [NodeFileSystem.layer, FFmpegCommandsService.Default],
  }
) {}
