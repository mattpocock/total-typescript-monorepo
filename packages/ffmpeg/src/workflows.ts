import { FileSystem } from "@effect/platform/FileSystem";
import {
  execAsync,
  runDavinciResolveScript,
  type AbsolutePath,
} from "@total-typescript/shared";
import { Config, Console, Data, Effect } from "effect";
import path from "path";
import {
  AskQuestionService,
  ReadStreamService,
  TranscriptStorageService,
} from "./services.js";
import {
  REMOTION_DIR,
  splitSubtitleSegments,
  type Subtitle,
} from "./subtitle-rendering.js";

import { NodeFileSystem } from "@effect/platform-node";
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
import {
  CouldNotCreateClipError,
  CouldNotExtractAudioError,
  CouldNotGetFPSError,
  FFmpegCommandsService,
} from "./ffmpeg-commands.js";
import { getQueueState } from "./queue/queue.js";
import type { ExecException } from "child_process";
import type {
  BadArgument,
  PlatformError,
  SystemError,
} from "@effect/platform/Error";
import {
  serializeMultiTrackClipsForAppendScript,
  type MultiTrackClip,
} from "./davinci-integration.js";
import { options } from "@effect/platform/HttpClientRequest";

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

      /**
       * Create a speaking-only video from a raw video.
       */
      const createAutoEditedVideoWorkflow = (
        options: CreateAutoEditedVideoWorkflowOptions
      ) => {
        return Effect.gen(function* () {
          const filename = `${options.outputFilename}.mp4`;

          const pathInExportDirectory = path.join(
            exportDirectory,
            filename
          ) as AbsolutePath;
          const pathInShortsDirectory = path.join(
            shortsExportDirectory,
            filename
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

          const tempDir = yield* fs.makeTempDirectoryScoped({
            directory: tmpdir(),
            prefix: "create-auto-edited-video",
          });

          const clips = yield* findClips({ inputVideo: options.inputVideo });

          const outputAudioPathFork = yield* Effect.fork(
            Effect.gen(function* () {
              const audioPath = yield* ffmpeg.extractAudioFromVideo(
                options.inputVideo
              );

              const audioClips = yield* Effect.all(
                clips.map((clip, index) => {
                  return Effect.gen(function* () {
                    const audioClipPath = yield* ffmpeg.createAudioClip(
                      audioPath,
                      clip.startTime,
                      clip.duration
                    );

                    yield* Console.log(
                      `✅ Created audio clip for clip ${index + 1}/${
                        clips.length
                      }`
                    );

                    return audioClipPath;
                  });
                })
              );

              const concatenatedAudioPath =
                yield* ffmpeg.concatenateAudioClips(audioClips);

              const normalizedAudioPath = join(
                tempDir,
                "normalized-audio.mp3"
              ) as AbsolutePath;

              yield* ffmpeg.normalizeAudio(
                concatenatedAudioPath,
                normalizedAudioPath
              );

              return normalizedAudioPath;
            })
          );

          const nonNormalizedVideoFork = yield* Effect.fork(
            createAutoEditedVideo({
              inputVideo: options.inputVideo,
              clips,
            })
          );

          const outputVideoFork = yield* Effect.fork(
            Effect.gen(function* () {
              return yield* ffmpeg.combineAudioAndVideo(
                yield* outputAudioPathFork,
                yield* nonNormalizedVideoFork
              );
            })
          );

          yield* Console.log(`Video created successfully`);

          if (options.subtitles) {
            const withSubtitlesPath = path.join(
              tempDir,
              `with-subtitles.mp4`
            ) as AbsolutePath;

            const fps = yield* fpsFork;

            const firstClipLength = clips[0]!.duration * fps;

            const totalDurationInFrames = clips.reduce(
              (acc, clip) => acc + clip.duration,
              0
            );

            yield* renderSubtitles({
              inputAudioPathFork: outputAudioPathFork,
              inputVideoPathFork: outputVideoFork,
              fpsFork: fpsFork,
              outputPath: withSubtitlesPath,
              ctaDurationInFrames: firstClipLength,
              durationInFrames: totalDurationInFrames * fps,
              originalFileName: path.parse(options.inputVideo).name,
            });

            // Copy the video to the final path
            yield* fs.copyFile(withSubtitlesPath, finalVideoPath);
          } else {
            // Copy the video to the final path
            yield* fs.copyFile(yield* outputVideoFork, finalVideoPath);

            yield* Console.log(
              "🎥 No subtitles requested, skipping subtitle generation"
            );

            yield* Console.log("🎥 Creating transcript from audio");
            const subtitles = yield* ffmpeg.createSubtitleFromAudio(
              yield* outputAudioPathFork
            );

            yield* Console.log("🎥 Storing transcript");
            yield* transcriptStorage.storeTranscript({
              transcript: subtitles.segments
                .map((s) => s.text)
                .join("")
                .trim(),
              filename: path.parse(options.inputVideo).name,
            });
          }
        });
      };

      const renderSubtitles = ({
        inputVideoPathFork,
        inputAudioPathFork,
        outputPath,
        ctaDurationInFrames,
        durationInFrames,
        originalFileName,
        fpsFork,
      }: {
        inputVideoPathFork: Effect.Effect<
          AbsolutePath,
          ExecException | CouldNotCreateClipError | PlatformError
        >;
        inputAudioPathFork: Effect.Effect<
          AbsolutePath,
          PlatformError | ExecException
        >;
        fpsFork: Effect.Effect<number, CouldNotGetFPSError>;
        outputPath: AbsolutePath;
        ctaDurationInFrames: number;
        durationInFrames: number;
        originalFileName: string;
      }) => {
        return Effect.gen(function* () {
          const startTime = Date.now();

          const subtitles = yield* ffmpeg.createSubtitleFromAudio(
            yield* inputAudioPathFork
          );

          const fullTranscriptText = subtitles.segments
            .map((s) => s.text)
            .join("")
            .trim();

          yield* transcriptStorage.storeTranscript({
            transcript: fullTranscriptText,
            filename: originalFileName,
          });

          const processedSubtitles = subtitles.segments.flatMap(
            splitSubtitleSegments
          );

          const fps = yield* fpsFork;

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

          const subtitlesOverlayPath = path.join(
            REMOTION_DIR,
            "out",
            "MyComp.mov"
          ) as AbsolutePath;

          yield* Console.log("🎬 Rendering subtitles...");
          const renderStart = Date.now();
          yield* ffmpeg.renderRemotion(subtitlesOverlayPath, {
            subtitles: subtitlesAsFrames,
            cta,
            ctaDurationInFrames,
            durationInFrames,
          });

          yield* Console.log(
            `✅ Subtitles rendered (took ${(Date.now() - renderStart) / 1000}s)`
          );

          yield* ffmpeg.overlaySubtitles(
            yield* inputVideoPathFork,
            subtitlesOverlayPath,
            outputPath
          );

          const totalTime = (Date.now() - startTime) / 1000;
          yield* Console.log(
            `✅ Successfully rendered subtitles! (Total time: ${totalTime}s)`
          );
        });
      };

      const findClips = Effect.fn("findClips")(function* (opts: {
        inputVideo: AbsolutePath;
      }) {
        const fpsFork = yield* Effect.fork(ffmpeg.getFPS(opts.inputVideo));

        const badTakeMarkersFork = yield* Effect.fork(
          extractBadTakeMarkersFromFile(opts.inputVideo, yield* fpsFork, ffmpeg)
        );

        const fps = yield* fpsFork;

        const silenceResultFork = yield* Effect.fork(
          findSilenceInVideo(opts.inputVideo, {
            threshold: THRESHOLD,
            silenceDuration: SILENCE_DURATION,
            startPadding: AUTO_EDITED_START_PADDING,
            endPadding: AUTO_EDITED_END_PADDING,
            fps,
            ffmpeg,
          })
        );

        const { speakingClips } = yield* silenceResultFork;
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

        return clips;
      });

      const createAutoEditedVideo = ({
        inputVideo,
        clips,
      }: {
        inputVideo: AbsolutePath;
        clips: {
          startTime: number;
          duration: number;
        }[];
      }) => {
        return Effect.gen(function* () {
          const startTime = Date.now();
          yield* Console.log("🎥 Processing video:", inputVideo);

          // Create a temporary directory for clips
          const tempDir = yield* fs.makeTempDirectoryScoped({
            directory: tmpdir(),
          });

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
                  `✅ Created clip ${i + 1}/${clips.length} (took ${(Date.now() - clipStart) / 1000}s)`
                );
                return outputFile;
              })
            ),
            {
              concurrency: "unbounded",
            }
          );
          yield* Console.log(
            `✅ Created all ${clips.length} clips (took ${(Date.now() - clipsStart) / 1000}s)`
          );

          const concatenatedVideoPath = join(
            tempDir,
            "concatenated-video.mp4"
          ) as AbsolutePath;

          // Concatenate all clips
          yield* Console.log("🎥 Concatenating clips...");
          const concatStart = Date.now();
          yield* ffmpeg.concatenateVideoClips(clipFiles, concatenatedVideoPath);
          yield* Console.log(
            `✅ Concatenated all clips (took ${(Date.now() - concatStart) / 1000}s)`
          );

          const totalTime = (Date.now() - startTime) / 1000;
          yield* Console.log(
            `✅ Successfully created speaking-only video! (Total time: ${totalTime}s)`
          );

          return concatenatedVideoPath;
        });
      };

      const roundToDecimalPlaces = (num: number, places: number) => {
        return Math.round(num * 10 ** places) / 10 ** places;
      };

      const editInterviewWorkflow = Effect.fn("editInterviewWorkflow")(
        function* (opts: {
          hostVideo: AbsolutePath;
          guestVideo: AbsolutePath;
          outputPath: AbsolutePath;
        }) {
          const hostClipsFork = yield* Effect.fork(
            findClips({ inputVideo: opts.hostVideo })
          );
          const guestClipsFork = yield* Effect.fork(
            findClips({ inputVideo: opts.guestVideo })
          );

          const hostClips = yield* hostClipsFork;
          const guestClips = yield* guestClipsFork;

          const interviewSpeakingClips = rawClipsToInterviewSpeakingClips({
            hostClips: hostClips,
            guestClips: guestClips,
          });

          const tempDir = yield* fs.makeTempDirectoryScoped({
            directory: tmpdir(),
          });

          const clipFiles = yield* Effect.all(
            interviewSpeakingClips.map((clip, i) =>
              Effect.gen(function* () {
                const clipStart = Date.now();
                const outputFile = join(
                  tempDir,
                  `clip-${i}.mp4`
                ) as AbsolutePath;

                // TODO: create clips to handle the case where the guest is speaking over the host
                yield* ffmpeg.createClip(
                  clip.state === "host-speaking"
                    ? opts.hostVideo
                    : opts.guestVideo,
                  outputFile,
                  clip.startTime,
                  clip.duration
                );

                yield* Console.log(
                  `✅ Created clip ${i + 1}/${interviewSpeakingClips.length} of ${clip.state} (took ${(Date.now() - clipStart) / 1000}s)`
                );
                return outputFile;
              })
            ),
            {
              concurrency: "unbounded",
            }
          );

          const concatenatedVideoPath = join(
            tempDir,
            "concatenated-video.mp4"
          ) as AbsolutePath;

          yield* ffmpeg.concatenateVideoClips(clipFiles, concatenatedVideoPath);

          yield* ffmpeg.normalizeAudio(concatenatedVideoPath, opts.outputPath);
        }
      );

      const moveInterviewToDavinciResolve = Effect.fn(
        "moveInterviewToDavinciResolve"
      )(function* (opts: {
        hostVideo: AbsolutePath;
        guestVideo: AbsolutePath;
      }) {
        const fpsFork = yield* Effect.fork(ffmpeg.getFPS(opts.hostVideo));
        const hostClipsFork = yield* Effect.fork(
          findClips({ inputVideo: opts.hostVideo })
        );
        const guestClipsFork = yield* Effect.fork(
          findClips({ inputVideo: opts.guestVideo })
        );

        const hostClips = yield* hostClipsFork;
        const guestClips = yield* guestClipsFork;

        const interviewSpeakingClips = rawClipsToInterviewSpeakingClips({
          hostClips: hostClips,
          guestClips: guestClips,
        });

        // Hard coded to 60fps for now, since that's what
        // we use in Davinci Resolve
        const OUTPUT_FPS = 60;

        const inputFPS = yield* fpsFork;

        const multiTrackClips: MultiTrackClip[] = [];

        let currentTimelineFrame = 0;

        for (const clip of interviewSpeakingClips) {
          const inputStartFrame = Math.floor(clip.startTime * inputFPS);
          const inputEndFrame = Math.ceil(
            (clip.startTime + clip.duration) * inputFPS
          );

          const timelineStartFrame = currentTimelineFrame;
          currentTimelineFrame += Math.ceil(clip.duration * OUTPUT_FPS);

          if (clip.state === "host-speaking") {
            multiTrackClips.push({
              startFrame: inputStartFrame,
              endFrame: inputEndFrame,
              videoIndex: 0, // Host goes on track 1
              timelineStartFrame,
            });
          }

          if (
            clip.state === "guest-speaking" ||
            clip.state === "guest-speaking-over-host"
          ) {
            multiTrackClips.push({
              startFrame: inputStartFrame,
              endFrame: inputEndFrame,
              videoIndex: 1, // Guest goes on track 2
              timelineStartFrame,
            });
          }
        }

        const output = yield* runDavinciResolveScript("clip-and-append.lua", {
          INPUT_VIDEOS: [opts.hostVideo, opts.guestVideo].join(":::"),
          CLIPS_TO_APPEND:
            serializeMultiTrackClipsForAppendScript(multiTrackClips),
          WSLENV: "INPUT_VIDEOS/p:CLIPS_TO_APPEND",
        });

        yield* Console.log(output.stdout);
        yield* Console.log(output.stderr);
      });

      const concatenateVideosWorkflow = (
        options: ConcatenateVideosWorkflowOptions
      ) => {
        return Effect.gen(function* () {
          const queueState = yield* getQueueState();

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
                    new Error(`Invalid action type for video ${item.id}`)
                  );
                }

                const videoName = item.action.videoName;
                let videoPath: AbsolutePath;

                if (item.action.dryRun) {
                  // Video is in export directory
                  if (item.action.subtitles) {
                    videoPath = path.join(
                      exportDirectory,
                      `${videoName}-with-subtitles.mp4`
                    ) as AbsolutePath;
                  } else {
                    videoPath = path.join(
                      exportDirectory,
                      `${videoName}.mp4`
                    ) as AbsolutePath;
                  }
                } else {
                  // Video is in shorts directory
                  videoPath = path.join(
                    shortsExportDirectory,
                    `${videoName}.mp4`
                  ) as AbsolutePath;
                }

                // Verify the video exists
                const exists = yield* fs.exists(videoPath);
                if (!exists) {
                  return yield* Effect.fail(
                    new Error(`Video file not found: ${videoPath}`)
                  );
                }

                return { path: videoPath, item };
              })
            )
          );

          // Check if output already exists
          const finalOutputDir = options.dryRun
            ? exportDirectory
            : shortsExportDirectory;
          const outputPath = path.join(
            finalOutputDir,
            `${options.outputVideoName}.mp4`
          ) as AbsolutePath;

          const outputExists = yield* fs.exists(outputPath);
          if (outputExists) {
            return yield* new FileAlreadyExistsError({
              message: `Output file already exists: ${outputPath}`,
            });
          }

          // Create temporary directory for processed clips
          const tempDir = yield* fs.makeTempDirectoryScoped({
            directory: tmpdir(),
            prefix: "concatenate-videos",
          });

          yield* Console.log(
            `🎬 Processing ${videoPaths.length} videos for concatenation...`
          );

          // Process each video to remove existing padding and add proper transitions
          const processedClips = yield* Effect.all(
            videoPaths.map((videoInfo, index) =>
              Effect.gen(function* () {
                const isLast = index === videoPaths.length - 1;
                const outputFile = join(
                  tempDir,
                  `processed-${index}.mp4`
                ) as AbsolutePath;

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
                yield* ffmpeg.trimVideo(
                  videoInfo.path,
                  outputFile,
                  0,
                  trimmedDuration
                );

                yield* Console.log(
                  `✅ Processed video ${index + 1}/${videoPaths.length}`
                );
                return outputFile;
              })
            ),
            {
              concurrency: "unbounded",
            }
          );

          // Concatenate all processed clips
          yield* Console.log("🎥 Concatenating videos...");
          yield* ffmpeg.concatenateVideoClips(processedClips, outputPath);
          yield* Console.log(
            `✅ Successfully concatenated videos to: ${outputPath}`
          );

          return outputPath;
        });
      };

      return {
        createAutoEditedVideoWorkflow,
        concatenateVideosWorkflow,
        editInterviewWorkflow,
        moveInterviewToDavinciResolve,
      };
    }),
    dependencies: [
      FFmpegCommandsService.Default,
      TranscriptStorageService.Default,
      AskQuestionService.Default,
      ReadStreamService.Default,
      NodeFileSystem.layer,
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

    const audioPath = yield* ffmpeg.extractAudioFromVideo(selectedVideo);

    const transcript = yield* ffmpeg.transcribeAudio(audioPath);

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

export const multiSelectVideosFromQueue = () => {
  return Effect.gen(function* () {
    const queueState = yield* getQueueState();
    const askQuestion = yield* AskQuestionService;

    // Find all completed video creation queue items
    const completedVideoItems = queueState.queue.filter(
      (item) =>
        item.status === "completed" &&
        item.action.type === "create-auto-edited-video"
    );

    if (completedVideoItems.length === 0) {
      yield* Console.log("No completed videos found in the queue.");
      return [];
    }

    // Sort by creation date (most recent first)
    const sortedVideoItems = completedVideoItems.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    const selectedVideoIds: string[] = [];

    while (true) {
      // Filter out already selected videos, maintaining the sorted order
      const availableVideos = sortedVideoItems.filter(
        (item) => !selectedVideoIds.includes(item.id)
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
              }
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
        choices
      );

      if (selection === "END") {
        break;
      }

      selectedVideoIds.push(selection as string);
      const selectedItem = sortedVideoItems.find(
        (item) => item.id === selection
      );
      if (
        selectedItem &&
        selectedItem.action.type === "create-auto-edited-video"
      ) {
        yield* Console.log(
          `✅ Added "${selectedItem.action.videoName}" to selection`
        );
      }
    }

    if (selectedVideoIds.length === 0) {
      yield* Console.log("No videos selected for concatenation.");
      return [];
    }

    yield* Console.log(
      `📝 Selected ${selectedVideoIds.length} videos for concatenation.`
    );
    return selectedVideoIds;
  });
};

const rawClipsToInterviewSpeakingClips = (opts: {
  hostClips: { startTime: number; duration: number }[];
  guestClips: { startTime: number; duration: number }[];
}) => {
  const rawEvents: RawClipEvent[] = [];

  for (const clip of opts.hostClips) {
    rawEvents.push({
      type: "clip-start",
      time: clip.startTime,
      speaker: "host",
    });

    rawEvents.push({
      type: "clip-end",
      time: clip.startTime + clip.duration,
      speaker: "host",
    });
  }

  for (const clip of opts.guestClips) {
    rawEvents.push({
      type: "clip-start",
      time: clip.startTime,
      speaker: "guest",
    });

    rawEvents.push({
      type: "clip-end",
      time: clip.startTime + clip.duration,
      speaker: "guest",
    });
  }

  const events = rawEvents.sort((a, b) => a.time - b.time);

  let state: InterviewState = "silence";

  const interviewSpeakingClips: InterviewSpeakingClip[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i]!;
    const nextEvent = events[i + 1];

    if (!nextEvent) {
      break;
    }

    const newState: InterviewState =
      stateMachine[state][`${event.speaker}-${event.type}`];

    if (newState !== "silence") {
      interviewSpeakingClips.push({
        state: newState,
        startTime: event.time,
        duration: nextEvent.time - event.time,
      });
    }

    state = newState;
  }

  return interviewSpeakingClips;
};

type RawClipEvent = {
  type: "clip-start" | "clip-end";
  time: number;
  speaker: "host" | "guest";
};

type InterviewSpeakingClip = {
  state: "host-speaking" | "guest-speaking" | "guest-speaking-over-host";
  startTime: number;
  duration: number;
};

type InterviewState =
  | "silence"
  | "host-speaking"
  | "guest-speaking"
  | "guest-speaking-over-host";
type InterviewEvent =
  | "host-clip-start"
  | "guest-clip-start"
  | "host-clip-end"
  | "guest-clip-end";

const stateMachine = {
  silence: {
    "host-clip-start": "host-speaking",
    "guest-clip-start": "guest-speaking",
    "host-clip-end": "silence",
    "guest-clip-end": "silence",
  },
  "host-speaking": {
    "host-clip-start": "host-speaking",
    "guest-clip-start": "guest-speaking",
    "host-clip-end": "silence",
    "guest-clip-end": "host-speaking",
  },
  "guest-speaking": {
    "guest-clip-start": "guest-speaking",
    "guest-clip-end": "silence",
    "host-clip-start": "guest-speaking-over-host",
    "host-clip-end": "guest-speaking",
  },
  "guest-speaking-over-host": {
    "guest-clip-start": "guest-speaking-over-host",
    "guest-clip-end": "host-speaking",
    "host-clip-start": "guest-speaking-over-host",
    "host-clip-end": "guest-speaking",
  },
} satisfies Record<InterviewState, Record<InterviewEvent, InterviewState>>;
