import { FileSystem } from "@effect/platform/FileSystem";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { Config, Console, Data, Effect } from "effect";
import path from "path";
import {
  AskQuestionLayerLive,
  FFmpegCommandsLayerLive,
  OpenAILayerLive,
  ReadStreamLayerLive,
} from "./layers.js";
import {
  AskQuestionService,
  FFmpegCommandsService,
  TranscriptStorageService,
} from "./services.js";
import {
  REMOTION_DIR,
  splitSubtitleSegments,
  type Subtitle,
} from "./subtitle-rendering.js";

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
import { findSilenceInVideo } from "./silence-detection.js";

export interface CreateAutoEditedVideoWorkflowOptions {
  inputVideo: AbsolutePath;
  outputFilename: string;
  dryRun?: boolean;
  subtitles?: boolean;
}

export class NoSpeakingClipsError extends Data.TaggedError(
  "NoSpeakingClipsError"
) {}

export class FileAlreadyExistsError extends Data.TaggedError(
  "FileAlreadyExistsError"
)<{
  message: string;
}> {}

export class CouldNotCreateSpeakingOnlyVideoError extends Data.TaggedError(
  "CouldNotCreateSpeakingOnlyVideoError"
)<{
  cause: Error;
}> {}

export class FFMPegWithComplexFilterError extends Data.TaggedError(
  "FFMPegWithComplexFilterError"
)<{
  stdout: string | undefined;
  stderr: string | undefined;
}> {}

const FFMPEG_CONCURRENCY_LIMIT = 6;

export class WorkflowsService extends Effect.Service<WorkflowsService>()(
  "WorkflowsService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem;
      const exportDirectory = yield* Config.string("EXPORT_DIRECTORY");
      const shortsExportDirectory = yield* Config.string(
        "SHORTS_EXPORT_DIRECTORY"
      );
      const transcriptStorage = yield* TranscriptStorageService;

      const ffmpeg = yield* FFmpegCommandsService;

      const createAutoEditedVideoWorkflow = (
        options: CreateAutoEditedVideoWorkflowOptions
      ) => {
        return Effect.gen(function* () {
          const [
            alreadyExistsInExportDirectory,
            alreadyExistsInShortsDirectory,
          ] = yield* Effect.all([
            fs.exists(
              path.join(exportDirectory, `${options.outputFilename}.mp4`)
            ),
            fs.exists(
              path.join(shortsExportDirectory, `${options.outputFilename}.mp4`)
            ),
          ]);

          if (alreadyExistsInExportDirectory) {
            return yield* new FileAlreadyExistsError({
              message: "File already exists in export directory",
            });
          }

          if (alreadyExistsInShortsDirectory) {
            return yield* new FileAlreadyExistsError({
              message: "File already exists in shorts directory",
            });
          }

          const fps = yield* ffmpeg.getFPS(options.inputVideo);

          // First create in the export directory
          const videoInExportDirectoryPath = path.join(
            exportDirectory,
            `${options.outputFilename}.mp4`
          ) as AbsolutePath;

          const result = yield* createAutoEditedVideo({
            inputVideo: options.inputVideo,
            outputVideo: videoInExportDirectoryPath,
          });

          const speakingClips = result.speakingClips;

          yield* Console.log(
            `Video created successfully at: ${videoInExportDirectoryPath}`
          );

          let finalVideoPath = videoInExportDirectoryPath;

          if (options.subtitles) {
            const withSubtitlesPath = path.join(
              exportDirectory,
              `${options.outputFilename}-with-subtitles.mp4`
            ) as AbsolutePath;

            const firstClipLength = speakingClips[0]!.duration * fps;

            const totalDurationInFrames = speakingClips.reduce(
              (acc, clip) => acc + clip.duration,
              0
            );

            if (!firstClipLength) {
              return yield* new NoSpeakingClipsError();
            }

            yield* renderSubtitles({
              inputPath: videoInExportDirectoryPath,
              outputPath: withSubtitlesPath,
              ctaDurationInFrames: firstClipLength,
              durationInFrames: totalDurationInFrames * fps,
              originalFileName: path.parse(options.inputVideo).name,
            });
            finalVideoPath = withSubtitlesPath;
          } else {
            const audioPath =
              `${videoInExportDirectoryPath}.mp3` as AbsolutePath;

            yield* ffmpeg.extractAudioFromVideo(
              videoInExportDirectoryPath,
              audioPath
            );

            const subtitles = yield* ffmpeg.createSubtitleFromAudio(audioPath);

            yield* transcriptStorage.storeTranscript({
              transcript: subtitles.segments
                .map((s) => s.text)
                .join("")
                .trim(),
              filename: path.parse(options.inputVideo).name,
            });

            yield* fs.remove(audioPath);
          }

          if (options.dryRun) {
            yield* Console.log(
              "Dry run mode: Skipping move to shorts directory"
            );
            return finalVideoPath;
          }

          // Then move to shorts directory
          const finalOutputPath = path.join(
            yield* Config.string("SHORTS_EXPORT_DIRECTORY"),
            `${options.outputFilename}.mp4`
          ) as AbsolutePath;

          yield* fs.rename(finalVideoPath, finalOutputPath);
          yield* Console.log(`Video moved to: ${finalOutputPath}`);

          return finalOutputPath;
        });
      };

      const renderSubtitles = ({
        inputPath,
        outputPath,
        ctaDurationInFrames,
        durationInFrames,
        originalFileName,
      }: {
        inputPath: AbsolutePath;
        outputPath: AbsolutePath;
        ctaDurationInFrames: number;
        durationInFrames: number;
        originalFileName: string;
      }) => {
        return Effect.gen(function* () {
          const startTime = Date.now();
          yield* Console.log("🎥 Processing video for subtitles:", inputPath);
          yield* Console.log("📝 Output will be saved to:", outputPath);

          const audioPath = `${inputPath}.mp3` as AbsolutePath;

          yield* Console.log("🎵 Extracting audio...");
          const audioStart = Date.now();
          yield* ffmpeg.extractAudioFromVideo(inputPath, audioPath);
          yield* Console.log(
            `✅ Audio extracted successfully (took ${(Date.now() - audioStart) / 1000}s)`
          );

          yield* Console.log("🎙️ Transcribing audio...");
          const transcribeStart = Date.now();
          const subtitles = yield* ffmpeg.createSubtitleFromAudio(audioPath);

          yield* Console.log(
            `✅ Audio transcribed successfully (took ${(Date.now() - transcribeStart) / 1000}s)`
          );

          const transcriptionPath = path.join(
            yield* Config.string("TRANSCRIPTION_DIRECTORY"),
            `${originalFileName}.txt`
          ) as AbsolutePath;

          const fullTranscriptText = subtitles.segments
            .map((s) => s.text)
            .join("")
            .trim();

          yield* fs.writeFileString(transcriptionPath, fullTranscriptText);

          const processedSubtitles = subtitles.segments.flatMap(
            splitSubtitleSegments
          );

          yield* Console.log("⏱️ Detecting video FPS...");
          const fpsStart = Date.now();
          const fps = yield* ffmpeg.getFPS(inputPath);
          yield* Console.log(
            `✅ Detected FPS: ${fps} (took ${(Date.now() - fpsStart) / 1000}s)`
          );

          const subtitlesAsFrames = processedSubtitles.map(
            (subtitle: Subtitle) => ({
              startFrame: Math.floor(subtitle.start * fps),
              endFrame: Math.floor(subtitle.end * fps),
              text: subtitle.text.trim(),
            })
          );

          yield* Console.log("🔍 Figuring out which CTA to show...");

          const cta = yield* ffmpeg.figureOutWhichCTAToShow(fullTranscriptText);

          yield* Console.log(`✅ Decided on CTA: ${cta}`);

          const meta = {
            subtitles: subtitlesAsFrames,
            cta,
            ctaDurationInFrames,
            durationInFrames,
          };

          const META_FILE_PATH = path.join(REMOTION_DIR, "src", "meta.json");
          yield* fs.writeFileString(META_FILE_PATH, JSON.stringify(meta));

          const subtitlesOverlayPath = path.join(
            REMOTION_DIR,
            "out",
            "MyComp.mov"
          ) as AbsolutePath;

          yield* Console.log("🎬 Rendering subtitles...");
          const renderStart = Date.now();
          yield* ffmpeg.renderRemotion(subtitlesOverlayPath, REMOTION_DIR);

          yield* Console.log(
            `✅ Subtitles rendered (took ${(Date.now() - renderStart) / 1000}s)`
          );

          yield* ffmpeg.overlaySubtitles(
            inputPath,
            subtitlesOverlayPath,
            outputPath
          );

          yield* fs.remove(audioPath);

          const totalTime = (Date.now() - startTime) / 1000;
          yield* Console.log(
            `✅ Successfully rendered subtitles! (Total time: ${totalTime}s)`
          );
        });
      };

      const createAutoEditedVideo = ({
        inputVideo,
        outputVideo,
      }: {
        inputVideo: AbsolutePath;
        outputVideo: AbsolutePath;
      }) => {
        return Effect.gen(function* () {
          const startTime = Date.now();
          yield* Console.log("🎥 Processing video:", inputVideo);
          yield* Console.log("📝 Output will be saved to:", outputVideo);

          // Get the video's FPS
          yield* Console.log("⏱️  Detecting video FPS...");
          const fpsStart = Date.now();
          const fps = yield* ffmpeg.getFPS(inputVideo);
          yield* Console.log(
            `✅ Detected FPS: ${fps} (took ${(Date.now() - fpsStart) / 1000}s)`
          );

          // First, find all speaking clips
          yield* Console.log("🔍 Finding speaking clips...");
          const speakingStart = Date.now();
          const { speakingClips } = yield* findSilenceInVideo(inputVideo, {
            threshold: THRESHOLD,
            silenceDuration: SILENCE_DURATION,
            startPadding: AUTO_EDITED_START_PADDING,
            endPadding: AUTO_EDITED_END_PADDING,
            fps,
            ffmpeg,
          });
          yield* Console.log(
            `✅ Found ${speakingClips.length} speaking clips (took ${(Date.now() - speakingStart) / 1000}s)`
          );

          // Then get all bad take markers
          yield* Console.log("🎯 Extracting bad take markers...");
          const markersStart = Date.now();
          const badTakeMarkers = yield* extractBadTakeMarkersFromFile(
            inputVideo,
            fps,
            ffmpeg
          );
          yield* Console.log(
            `✅ Found ${badTakeMarkers.length} bad take markers (took ${(Date.now() - markersStart) / 1000}s)`
          );

          // Filter out bad takes
          yield* Console.log("🔍 Filtering out bad takes...");
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
          yield* Console.log(
            `✅ Found ${goodClips.length} good clips (took ${(Date.now() - filterStart) / 1000}s)`
          );

          if (goodClips.length === 0) {
            yield* Console.log("❌ No good clips found");
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
          yield* Console.log("🎬 Creating individual clips...");
          const clipsStart = Date.now();
          const clipFiles = yield* Effect.all(
            clips.map((clip, i) =>
              Effect.gen(function* () {
                const clipStart = Date.now();
                const outputFile = join(
                  tempDir,
                  `clip-${i}.mp4`
                ) as AbsolutePath;

                yield* ffmpeg.createClip(
                  inputVideo,
                  outputFile,
                  clip.startTime,
                  clip.duration
                );

                yield* Console.log(
                  `✅ Created clip ${i + 1}/${goodClips.length} (took ${(Date.now() - clipStart) / 1000}s)`
                );
                return outputFile;
              })
            ),
            {
              concurrency: FFMPEG_CONCURRENCY_LIMIT,
            }
          );
          yield* Console.log(
            `✅ Created all ${goodClips.length} clips (took ${(Date.now() - clipsStart) / 1000}s)`
          );

          // Create a concat file
          const concatFile = join(tempDir, "concat.txt") as AbsolutePath;
          const concatContent = clipFiles
            .map((file: string) => `file '${file}'`)
            .join("\n");

          yield* fs.writeFileString(concatFile, concatContent);

          // Concatenate all clips
          yield* Console.log("🎥 Concatenating clips...");
          const concatStart = Date.now();
          yield* ffmpeg.concatenateClips(concatFile, outputVideo);
          yield* Console.log(
            `✅ Concatenated all clips (took ${(Date.now() - concatStart) / 1000}s)`
          );

          // Clean up temporary files
          yield* fs.remove(tempDir, { recursive: true, force: true });

          const totalTime = (Date.now() - startTime) / 1000;
          yield* Console.log(
            `✅ Successfully created speaking-only video! (Total time: ${totalTime}s)`
          );
          return { speakingClips: clips };
        });
      };

      const roundToDecimalPlaces = (num: number, places: number) => {
        return Math.round(num * 10 ** places) / 10 ** places;
      };

      return {
        createAutoEditedVideoWorkflow,
      };
    }),
    dependencies: [
      FFmpegCommandsLayerLive,
      TranscriptStorageService.Default,
      AskQuestionLayerLive,
      ReadStreamLayerLive,
      OpenAILayerLive,
    ],
  }
) {}

export const transcribeVideoWorkflow = () => {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const ffmpeg = yield* FFmpegCommandsService;

    const exportDirectory = yield* Config.string("EXPORT_DIRECTORY");
    const shortsExportDirectory = yield* Config.string(
      "SHORTS_EXPORT_DIRECTORY"
    );

    // Get all files from both directories
    const [exportFiles, shortsFiles] = yield* Effect.all([
      fs.readDirectory(exportDirectory),
      fs.readDirectory(shortsExportDirectory),
    ]);

    // Get stats for all files in parallel
    const exportStats = yield* Effect.all(
      exportFiles
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => {
          return Effect.gen(function* () {
            const fullPath = path.join(exportDirectory, file) as AbsolutePath;
            const stats = yield* fs.stat(fullPath);
            const mtime = yield* stats.mtime;
            return {
              title: `Export: ${file}`,
              value: fullPath,
              mtime,
            };
          });
        })
    );

    const shortsStats = yield* Effect.all(
      shortsFiles
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => {
          return Effect.gen(function* () {
            const fullPath = path.join(
              shortsExportDirectory,
              file
            ) as AbsolutePath;
            const stats = yield* fs.stat(fullPath);
            const mtime = yield* stats.mtime;
            return {
              title: `Shorts: ${file}`,
              value: fullPath,
              mtime,
            };
          });
        })
    );

    // Combine and sort by modification time (newest first)
    const videoFiles = [...exportStats, ...shortsStats].sort(
      (a, b) => b.mtime.getTime() - a.mtime.getTime()
    );

    if (videoFiles.length === 0) {
      yield* Console.error("No video files found in either directory");
      process.exit(1);
    }

    const askQuestion = yield* AskQuestionService;

    const selectedVideo = yield* askQuestion.select(
      "Select a video to transcribe",
      videoFiles.map((file) => ({
        title: file.title,
        value: file.value,
      }))
    );

    if (!selectedVideo) {
      yield* Console.error("No video selected");
      process.exit(1);
    }

    yield* Console.log("Transcribing video...");

    const audioPath = path.join(
      path.dirname(selectedVideo),
      `${path.basename(selectedVideo)}.${yield* Config.string("AUDIO_FILE_EXTENSION")}`
    ) as AbsolutePath;

    yield* ffmpeg.extractAudioFromVideo(selectedVideo, audioPath);

    const transcript = yield* ffmpeg.transcribeAudio(audioPath);

    yield* fs.remove(audioPath);
    yield* Console.log("\nTranscript:");
    yield* Console.log(transcript);
  });
};

export const moveRawFootageToLongTermStorage = () => {
  return Effect.gen(function* () {
    const longTermStorageDirectory = yield* Config.string(
      "LONG_TERM_FOOTAGE_STORAGE_DIRECTORY"
    );

    const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");

    yield* execAsync(
      `(cd "${longTermStorageDirectory}" && mv "${obsOutputDirectory}"/* .)`
    );
  });
};
