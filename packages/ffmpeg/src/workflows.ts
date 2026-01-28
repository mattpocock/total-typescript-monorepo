import { FileSystem } from "@effect/platform/FileSystem";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { Config, Console, Data, Effect } from "effect";
import path from "path";
import {
  AskQuestionService,
  ReadStreamService,
  TranscriptStorageService,
} from "./services.js";
import { splitSubtitleSegments, type Subtitle } from "./subtitle-rendering.js";

import { NodeFileSystem } from "@effect/platform-node";
import type { PlatformError } from "@effect/platform/Error";
import type { ExecException } from "child_process";
import {
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
  AUTO_EDITED_VIDEO_FINAL_END_PADDING,
  SILENCE_DURATION,
  THRESHOLD,
} from "./constants.js";
import {
  CouldNotCreateClipError,
  FFmpegCommandsService,
} from "./ffmpeg-commands.js";
import { QueueUpdaterService } from "./queue/queue-updater-service.js";
import { findSilenceInVideo } from "./silence-detection.js";
import type { ClipWithMetadata } from "./video-clip-types.js";

export interface CreateAutoEditedVideoWorkflowOptions {
  inputVideo: AbsolutePath;
  outputFilename: string;
  dryRun?: boolean;
  subtitles?: boolean;
}

export interface ConcatenateVideosWorkflowOptions {
  videoIds: string[];
  outputVideoName: string;
  dryRun?: boolean;
}

export class NoSpeakingClipsError extends Data.TaggedError(
  "NoSpeakingClipsError",
) {}

export class FileAlreadyExistsError extends Data.TaggedError(
  "FileAlreadyExistsError",
)<{
  message: string;
}> {}

export class CouldNotCreateSpeakingOnlyVideoError extends Data.TaggedError(
  "CouldNotCreateSpeakingOnlyVideoError",
)<{
  cause: Error;
}> {}

export class FFMPegWithComplexFilterError extends Data.TaggedError(
  "FFMPegWithComplexFilterError",
)<{
  stdout: string | undefined;
  stderr: string | undefined;
}> {}

interface CreateVideoFromClipsWorkflowOptions {
  clips: readonly ClipWithMetadata[];
  outputVideoName: string;
  shortsDirectoryOutputName: string | undefined;
}

export class WorkflowsService extends Effect.Service<WorkflowsService>()(
  "WorkflowsService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem;
      const exportDirectory = yield* Config.string("EXPORT_DIRECTORY");
      const shortsExportDirectory = yield* Config.string(
        "SHORTS_EXPORT_DIRECTORY",
      );
      const transcriptStorage = yield* TranscriptStorageService;
      const queueUpdater = yield* QueueUpdaterService;
      const ffmpeg = yield* FFmpegCommandsService;

      /**
       * Create a speaking-only video from a raw video.
       */
      const createAutoEditedVideoWorkflow = (
        options: CreateAutoEditedVideoWorkflowOptions,
      ) => {
        return Effect.gen(function* () {
          const filename = `${options.outputFilename}.mp4`;

          const pathInExportDirectory = path.join(
            exportDirectory,
            filename,
          ) as AbsolutePath;
          const pathInShortsDirectory = path.join(
            shortsExportDirectory,
            filename,
          ) as AbsolutePath;

          if (yield* fs.exists(pathInExportDirectory)) {
            return yield* new FileAlreadyExistsError({
              message: "File already exists in export directory",
            });
          }

          if (yield* fs.exists(pathInShortsDirectory)) {
            return yield* new FileAlreadyExistsError({
              message: "File already exists in shorts directory",
            });
          }

          const finalVideoPath = options.dryRun
            ? pathInExportDirectory
            : pathInShortsDirectory;

          const fpsFork = yield* Effect.fork(ffmpeg.getFPS(options.inputVideo));

          const clips = yield* findClips({
            inputVideo: options.inputVideo,
            mode: "entire-video",
          });

          const videoFork = yield* Effect.fork(
            createAutoEditedVideo({
              clips: clips.map((clip) => {
                return {
                  inputVideo: options.inputVideo,
                  startTime: clip.startTime,
                  duration: clip.duration,
                  beatType: "none",
                };
              }),
            }),
          );

          if (options.subtitles) {
            const fps = yield* fpsFork;

            const firstClipLength = clips[0]!.duration * fps;

            const totalDuration = clips.reduce(
              (acc, clip) => acc + clip.duration,
              0,
            );

            const autoEditedAudioPathFork = yield* Effect.fork(
              createAutoEditedAudio({
                clips: clips.map((clip) => {
                  return {
                    inputVideo: options.inputVideo,
                    startTime: clip.startTime,
                    duration: clip.duration,
                    beatType: "none",
                  };
                }),
              }),
            );

            const withSubtitlesPath = yield* renderSubtitles({
              autoEditedVideoPathFork: videoFork,
              autoEditedAudioPathFork,
              fps,
              ctaDurationInFrames: firstClipLength,
              durationInFrames: totalDuration * fps,
            });

            // Copy the video to the final path
            yield* fs.copyFile(withSubtitlesPath, finalVideoPath);
          } else {
            const filename = path.parse(options.inputVideo).name;

            const existingSubtitles = yield* transcriptStorage.getSubtitleFile({
              filename,
            });
            if (existingSubtitles) {
              yield* Effect.log(
                `[createAutoEditedVideoWorkflow] Existing subtitles found`,
              );
            } else {
              yield* Effect.log(
                `[createAutoEditedVideoWorkflow] Creating subtitles...`,
              );
              yield* getSubtitlesForClips({
                clips: clips.map((clip) => {
                  return {
                    inputVideo: options.inputVideo,
                    startTime: clip.startTime,
                    duration: clip.duration,
                    beatType: "none",
                  };
                }),
              });
            }

            // Copy the video to the final path
            yield* fs.copyFile(yield* videoFork, finalVideoPath);
            yield* Effect.log(
              `[createAutoEditedVideoWorkflow] Video created and copied to ${finalVideoPath}`,
            );
          }
        });
      };

      const getSubtitlesForClips = (options: {
        clips: readonly ClipWithMetadata[];
      }) =>
        Effect.gen(function* () {
          const uniqueInputVideos = [
            ...new Set(options.clips.map((clip) => clip.inputVideo)),
          ];

          const audioPaths = yield* Effect.all(
            uniqueInputVideos.map((inputVideo) => {
              return ffmpeg.extractAudioFromVideo(inputVideo).pipe(
                Effect.map((audioPath) => {
                  return {
                    inputVideo,
                    audioPath,
                  };
                }),
              );
            }),
            {
              concurrency: "unbounded",
            },
          );

          const clips = yield* Effect.all(
            options.clips.map((clip, index) => {
              return Effect.gen(function* () {
                const audioPath = audioPaths.find(
                  (audioPath) => audioPath.inputVideo === clip.inputVideo,
                )?.audioPath;

                if (!audioPath) {
                  return yield* Effect.die("An impossible error occurred");
                }

                const audioClipPath = yield* ffmpeg.createAudioClip(
                  audioPath,
                  clip.startTime,
                  clip.duration,
                );

                yield* Effect.log(
                  `[createAutoEditedAudio] Created audio clip for clip ${index + 1}/${options.clips.length}`,
                );

                const subtitles =
                  yield* ffmpeg.createSubtitleFromAudio(audioClipPath);

                return {
                  start: clip.startTime,
                  end: clip.startTime + clip.duration,
                  segments: subtitles.segments,
                  words: subtitles.words,
                };
              });
            }),
            {
              concurrency: "unbounded",
            },
          );

          return { clips };
        });

      const renderSubtitles = ({
        autoEditedVideoPathFork,
        autoEditedAudioPathFork,
        ctaDurationInFrames,
        durationInFrames,
        fps,
      }: {
        autoEditedVideoPathFork: Effect.Effect<
          AbsolutePath,
          ExecException | CouldNotCreateClipError | PlatformError
        >;
        autoEditedAudioPathFork: Effect.Effect<
          AbsolutePath,
          ExecException | CouldNotCreateClipError | PlatformError
        >;
        fps: number;
        ctaDurationInFrames: number;
        durationInFrames: number;
      }) => {
        return Effect.gen(function* () {
          // TODO: Somehow make the subtitle storage work for this
          const subtitles = yield* ffmpeg.createSubtitleFromAudio(
            yield* autoEditedAudioPathFork,
          );

          const processedSubtitles = subtitles.segments.flatMap(
            splitSubtitleSegments,
          );

          const subtitlesAsFrames = processedSubtitles.map(
            (subtitle: Subtitle) => ({
              startFrame: Math.floor(subtitle.start * fps),
              endFrame: Math.floor(subtitle.end * fps),
              text: subtitle.text.trim(),
            }),
          );

          yield* Effect.log("[renderSubtitles] Figuring out which CTA to show");

          const cta = "ai";

          yield* Effect.log(`[renderSubtitles] Decided on CTA: ${cta}`);

          yield* Effect.log("[renderSubtitles] Rendering subtitles");
          const subtitlesOverlayPath = yield* ffmpeg.renderRemotion({
            subtitles: subtitlesAsFrames,
            cta,
            ctaDurationInFrames,
            durationInFrames,
          });

          yield* Effect.log(`[renderSubtitles] Subtitles rendered`);

          const outputPath = yield* ffmpeg.overlaySubtitles(
            yield* autoEditedVideoPathFork,
            subtitlesOverlayPath,
          );

          return outputPath;
        });
      };

      const findClips = Effect.fn("findClips")(function* (opts: {
        inputVideo: AbsolutePath;
        mode: "entire-video" | "part-of-video";
        startTime?: number;
      }) {
        const fps = yield* ffmpeg.getFPS(opts.inputVideo);

        const { speakingClips } = yield* findSilenceInVideo(opts.inputVideo, {
          threshold: THRESHOLD,
          silenceDuration: SILENCE_DURATION,
          startPadding: AUTO_EDITED_START_PADDING,
          endPadding: AUTO_EDITED_END_PADDING,
          fps,
          ffmpeg,
          startTime: opts.startTime,
        });

        const clips = speakingClips.map((clip, i, clips) => {
          const resolvedDuration = roundToDecimalPlaces(
            clip.durationInFrames / fps,
            2,
          );

          let duration: number;

          if (opts.mode === "entire-video") {
            duration =
              i === clips.length - 1
                ? resolvedDuration +
                  AUTO_EDITED_VIDEO_FINAL_END_PADDING -
                  AUTO_EDITED_END_PADDING
                : resolvedDuration;
          } else {
            duration = resolvedDuration;
          }

          return {
            startTime: clip.startTime,
            duration,
          };
        });

        const totalDuration = clips.reduce(
          (acc, clip) => acc + clip.duration,
          0,
        );

        const minutes = Math.floor(totalDuration / 60)
          .toString()
          .padStart(2, "0");
        const seconds = Math.ceil(totalDuration % 60)
          .toString()
          .padStart(2, "0");

        yield* Effect.log(`[findClips] Total duration: ${minutes}:${seconds}`);

        return clips;
      });

      const createAutoEditedAudio = (options: {
        clips: readonly ClipWithMetadata[];
      }) => {
        return Effect.gen(function* () {
          const clips = yield* Effect.all(
            options.clips.map((clip) =>
              ffmpeg.createAudioClip(
                clip.inputVideo,
                clip.startTime,
                clip.duration,
              ),
            ),
            {
              concurrency: "unbounded",
            },
          );

          const concatenatedAudio = yield* ffmpeg.concatenateAudioClips(clips);

          const normalizedAudio =
            yield* ffmpeg.normalizeAudio(concatenatedAudio);

          return normalizedAudio;
        });
      };

      const createAutoEditedVideo = ({
        clips,
      }: {
        clips: readonly ClipWithMetadata[];
      }) => {
        return Effect.gen(function* () {
          yield* Effect.log(
            `[createAutoEditedVideo] Creating and concatenating ${clips.length} clips in single pass`,
          );

          const concatenatedVideoPath =
            yield* ffmpeg.createAndConcatenateVideoClipsSinglePass(clips);

          yield* Effect.log("[createAutoEditedVideo] Normalizing audio");

          const normalizedAudio = yield* ffmpeg.normalizeAudio(
            concatenatedVideoPath,
          );

          return normalizedAudio;
        });
      };

      const roundToDecimalPlaces = (num: number, places: number) => {
        return Math.round(num * 10 ** places) / 10 ** places;
      };

      const createVideoFromClipsWorkflow = (
        options: CreateVideoFromClipsWorkflowOptions,
      ) => {
        return Effect.gen(function* () {
          const outputVideoName = options.outputVideoName;

          const videoFork = yield* Effect.fork(
            createAutoEditedVideo({
              clips: options.clips,
            }),
          );

          let videoPath: AbsolutePath;

          if (options.shortsDirectoryOutputName) {
            const audioFork = yield* Effect.fork(
              createAutoEditedAudio({
                clips: options.clips,
              }),
            );

            const fps = yield* ffmpeg.getFPS(options.clips[0]!.inputVideo);

            const totalDuration = options.clips.reduce(
              (acc, clip) => acc + clip.duration,
              0,
            );

            const totalDurationInFrames = totalDuration * fps;

            const videoWithSubtitles = yield* renderSubtitles({
              autoEditedVideoPathFork: videoFork,
              autoEditedAudioPathFork: audioFork,
              fps,
              ctaDurationInFrames: options.clips[0]!.duration * fps,
              durationInFrames: totalDurationInFrames,
            });

            const shortsOutputPath = path.join(
              shortsExportDirectory,
              options.shortsDirectoryOutputName + ".mp4",
            ) as AbsolutePath;

            videoPath = videoWithSubtitles;
            yield* fs.copyFile(videoPath, shortsOutputPath);
          } else {
            videoPath = yield* videoFork;
          }

          const outputPath = path.join(
            exportDirectory,
            `${outputVideoName}.mp4`,
          ) as AbsolutePath;

          yield* fs.copyFile(videoPath, outputPath);

          yield* Console.log(
            `✅ Successfully created video from clips: ${outputPath}`,
          );

          return outputPath;
        });
      };

      const concatenateVideosWorkflow = (
        options: ConcatenateVideosWorkflowOptions,
      ) => {
        return Effect.gen(function* () {
          const queueState = yield* queueUpdater.getQueueState();

          // Find the videos from queue items
          const videoItems = options.videoIds.map((id) => {
            const item = queueState.queue.find((i) => i.id === id);
            if (
              !item ||
              item.status !== "completed" ||
              item.action.type !== "create-auto-edited-video"
            ) {
              throw new Error(`Video with ID ${id} not found or not completed`);
            }
            return item;
          });

          // Determine output paths for each video
          const videoPaths = yield* Effect.all(
            videoItems.map((item) =>
              Effect.gen(function* () {
                if (item.action.type !== "create-auto-edited-video") {
                  return yield* Effect.fail(
                    new Error(`Invalid action type for video ${item.id}`),
                  );
                }

                const videoName = item.action.videoName;
                let videoPath: AbsolutePath;

                if (item.action.dryRun) {
                  // Video is in export directory
                  if (item.action.subtitles) {
                    videoPath = path.join(
                      exportDirectory,
                      `${videoName}-with-subtitles.mp4`,
                    ) as AbsolutePath;
                  } else {
                    videoPath = path.join(
                      exportDirectory,
                      `${videoName}.mp4`,
                    ) as AbsolutePath;
                  }
                } else {
                  // Video is in shorts directory
                  videoPath = path.join(
                    shortsExportDirectory,
                    `${videoName}.mp4`,
                  ) as AbsolutePath;
                }

                // Verify the video exists
                const exists = yield* fs.exists(videoPath);
                if (!exists) {
                  return yield* Effect.fail(
                    new Error(`Video file not found: ${videoPath}`),
                  );
                }

                return { path: videoPath, item };
              }),
            ),
          );

          // Check if output already exists
          const finalOutputDir = options.dryRun
            ? exportDirectory
            : shortsExportDirectory;
          const outputPath = path.join(
            finalOutputDir,
            `${options.outputVideoName}.mp4`,
          ) as AbsolutePath;

          const outputExists = yield* fs.exists(outputPath);
          if (outputExists) {
            return yield* new FileAlreadyExistsError({
              message: `Output file already exists: ${outputPath}`,
            });
          }

          yield* Effect.log(
            `[concatenateVideosWorkflow] Processing ${videoPaths.length} videos for concatenation`,
          );

          // Process each video to remove existing padding and add proper transitions
          const processedClips = yield* Effect.all(
            videoPaths.map((videoInfo, index) =>
              Effect.gen(function* () {
                const isLast = index === videoPaths.length - 1;

                // Get video duration
                const duration = yield* ffmpeg.getVideoDuration(videoInfo.path);

                let trimmedDuration: number;
                if (isLast) {
                  // For the last video, keep the existing AUTO_EDITED_VIDEO_FINAL_END_PADDING
                  trimmedDuration = duration;
                } else {
                  // For all other videos, replace AUTO_EDITED_VIDEO_FINAL_END_PADDING with AUTO_EDITED_END_PADDING
                  // Remove the large padding and add back the small padding
                  trimmedDuration =
                    duration -
                    AUTO_EDITED_VIDEO_FINAL_END_PADDING +
                    AUTO_EDITED_END_PADDING;
                }

                // Trim the video to remove existing padding
                const outputFile = yield* ffmpeg.trimVideo(
                  videoInfo.path,
                  0,
                  trimmedDuration,
                );

                const normalizedAudio =
                  yield* ffmpeg.normalizeAudio(outputFile);

                yield* Effect.log(
                  `[concatenateVideosWorkflow] Processed video ${index + 1}/${videoPaths.length}`,
                );
                return normalizedAudio;
              }),
            ),
            {
              concurrency: "unbounded",
            },
          );

          // Concatenate all processed clips
          yield* Effect.log("[concatenateVideosWorkflow] Concatenating videos");
          const concatenatedVideo =
            yield* ffmpeg.concatenateVideoClips(processedClips);

          yield* fs.copyFile(concatenatedVideo, outputPath);

          yield* Console.log(
            `✅ Successfully concatenated videos to: ${outputPath}`,
          );

          return outputPath;
        });
      };

      return {
        createAutoEditedVideoWorkflow,
        createVideoFromClipsWorkflow,
        concatenateVideosWorkflow,
        findClips,
        createAutoEditedAudio,
        getSubtitlesForClips,
      };
    }),
    dependencies: [
      FFmpegCommandsService.Default,
      TranscriptStorageService.Default,
      AskQuestionService.Default,
      ReadStreamService.Default,
      NodeFileSystem.layer,
      QueueUpdaterService.Default,
    ],
  },
) {}

export const moveRawFootageToLongTermStorage = () => {
  return Effect.gen(function* () {
    const longTermStorageDirectory = yield* Config.string(
      "LONG_TERM_FOOTAGE_STORAGE_DIRECTORY",
    );

    const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");

    yield* execAsync(
      `(cd "${longTermStorageDirectory}" && mv "${obsOutputDirectory}"/* .)`,
    );
  });
};

export const multiSelectVideosFromQueue = () => {
  return Effect.gen(function* () {
    const queueUpdater = yield* QueueUpdaterService;
    const queueState = yield* queueUpdater.getQueueState();
    const askQuestion = yield* AskQuestionService;

    // Find all completed video creation queue items
    const completedVideoItems = queueState.queue.filter(
      (item) =>
        item.status === "completed" &&
        item.action.type === "create-auto-edited-video",
    );

    if (completedVideoItems.length === 0) {
      yield* Console.log("No completed videos found in the queue.");
      return [];
    }

    // Sort by creation date (most recent first)
    const sortedVideoItems = completedVideoItems.sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    const selectedVideoIds: string[] = [];

    while (true) {
      // Filter out already selected videos, maintaining the sorted order
      const availableVideos = sortedVideoItems.filter(
        (item) => !selectedVideoIds.includes(item.id),
      );

      if (availableVideos.length === 0) {
        yield* Console.log("All available videos have been selected.");
        break;
      }

      // Prepare choices with "End" option at the very top
      const choices = [
        { title: "End - Finish selecting videos", value: "END" },
        ...availableVideos.map((item) => {
          if (item.action.type === "create-auto-edited-video") {
            const createdDate = new Date(item.createdAt).toLocaleDateString();
            const createdTime = new Date(item.createdAt).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            return {
              title: `${item.action.videoName} (${createdDate} ${createdTime})`,
              value: item.id,
            };
          }
          return { title: "Unknown", value: item.id };
        }),
      ];

      const selectedMessage =
        selectedVideoIds.length > 0
          ? ` (${selectedVideoIds.length} videos selected)`
          : "";

      const selection = yield* askQuestion.select(
        `Select a video to add to concatenation${selectedMessage}:`,
        choices,
      );

      if (selection === "END") {
        break;
      }

      selectedVideoIds.push(selection as string);
      const selectedItem = sortedVideoItems.find(
        (item) => item.id === selection,
      );
      if (
        selectedItem &&
        selectedItem.action.type === "create-auto-edited-video"
      ) {
        yield* Console.log(
          `✅ Added "${selectedItem.action.videoName}" to selection`,
        );
      }
    }

    if (selectedVideoIds.length === 0) {
      yield* Console.log("No videos selected for concatenation.");
      return [];
    }

    yield* Console.log(
      `📝 Selected ${selectedVideoIds.length} videos for concatenation.`,
    );
    return selectedVideoIds;
  });
};
