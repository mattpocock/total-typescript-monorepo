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
import type { PlatformError } from "@effect/platform/Error";
import type { ExecException } from "child_process";
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
import {
  serializeMultiTrackClipsForAppendScript,
  type MultiTrackClip,
} from "./davinci-integration.js";
import {
  CouldNotCreateClipError,
  CouldNotGetFPSError,
  FFmpegCommandsService,
} from "./ffmpeg-commands.js";
import { QueueUpdaterService } from "./queue/queue-updater-service.js";
import { findSilenceInVideo } from "./silence-detection.js";
import type { VideoClip } from "./video-clip-types.js";

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

interface CreateVideoFromClipsWorkflowOptions {
  clips: readonly {
    startTime: number;
    duration: number;
    inputVideo: string;
  }[];
  outputVideoName: string;
}

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
      const queueUpdater = yield* QueueUpdaterService;
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

          const clips = yield* findClips({
            inputVideo: options.inputVideo,
            mode: "entire-video",
          });

          const videoFork = yield* Effect.fork(
            createAutoEditedVideo({
              inputVideo: options.inputVideo,
              clips,
            })
          );

          if (options.subtitles) {
            const fps = yield* fpsFork;

            const firstClipLength = clips[0]!.duration * fps;

            const totalDurationInFrames = clips.reduce(
              (acc, clip) => acc + clip.duration,
              0
            );

            const autoEditedAudioPathFork = yield* Effect.fork(
              createAutoEditedAudio({
                inputVideo: options.inputVideo,
                clips,
              })
            );

            const withSubtitlesPath = yield* renderSubtitles({
              autoEditedVideoPathFork: videoFork,
              autoEditedAudioPathFork,
              fpsFork: fpsFork,
              ctaDurationInFrames: firstClipLength,
              durationInFrames: totalDurationInFrames * fps,
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
                `[createAutoEditedVideoWorkflow] Existing subtitles found`
              );
            } else {
              yield* Effect.log(
                `[createAutoEditedVideoWorkflow] Creating subtitles...`
              );
              yield* getSubtitlesForClips({
                clips: clips.map((clip) => {
                  return {
                    inputVideo: options.inputVideo,
                    startTime: clip.startTime,
                    duration: clip.duration,
                  };
                }),
              });
            }

            // Copy the video to the final path
            yield* fs.copyFile(yield* videoFork, finalVideoPath);
            yield* Effect.log(
              `[createAutoEditedVideoWorkflow] Video created and copied to ${finalVideoPath}`
            );
          }
        });
      };

      const getSubtitlesForClips = (options: {
        clips: readonly {
          inputVideo: AbsolutePath;
          startTime: number;
          duration: number;
        }[];
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
                })
              );
            }),
            {
              concurrency: "unbounded",
            }
          );

          const clips = yield* Effect.all(
            options.clips.map((clip, index) => {
              return Effect.gen(function* () {
                const audioPath = audioPaths.find(
                  (audioPath) => audioPath.inputVideo === clip.inputVideo
                )?.audioPath;

                if (!audioPath) {
                  return yield* Effect.die("An impossible error occurred");
                }

                const audioClipPath = yield* ffmpeg.createAudioClip(
                  audioPath,
                  clip.startTime,
                  clip.duration
                );

                yield* Effect.log(
                  `[createAutoEditedAudio] Created audio clip for clip ${index + 1}/${options.clips.length}`
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
            }
          );

          return { clips };
        });

      const renderSubtitles = ({
        autoEditedVideoPathFork,
        autoEditedAudioPathFork,
        ctaDurationInFrames,
        durationInFrames,
        fpsFork,
      }: {
        autoEditedVideoPathFork: Effect.Effect<
          AbsolutePath,
          ExecException | CouldNotCreateClipError | PlatformError
        >;
        autoEditedAudioPathFork: Effect.Effect<
          AbsolutePath,
          ExecException | CouldNotCreateClipError | PlatformError
        >;
        fpsFork: Effect.Effect<number, CouldNotGetFPSError>;
        ctaDurationInFrames: number;
        durationInFrames: number;
      }) => {
        return Effect.gen(function* () {
          // TODO: Somehow make the subtitle storage work for this
          const subtitles = yield* ffmpeg.createSubtitleFromAudio(
            yield* autoEditedAudioPathFork
          );

          const fullTranscriptText = subtitles.segments
            .map((s) => s.text)
            .join("")
            .trim();

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

          yield* Effect.log("[renderSubtitles] Figuring out which CTA to show");

          const cta = yield* ffmpeg.figureOutWhichCTAToShow(fullTranscriptText);

          yield* Effect.log(`[renderSubtitles] Decided on CTA: ${cta}`);

          const subtitlesOverlayPath = path.join(
            REMOTION_DIR,
            "out",
            "MyComp.mov"
          ) as AbsolutePath;

          yield* Effect.log("[renderSubtitles] Rendering subtitles");
          yield* ffmpeg.renderRemotion(subtitlesOverlayPath, {
            subtitles: subtitlesAsFrames,
            cta,
            ctaDurationInFrames,
            durationInFrames,
          });

          yield* Effect.log(`[renderSubtitles] Subtitles rendered`);

          const outputPath = yield* ffmpeg.overlaySubtitles(
            yield* autoEditedVideoPathFork,
            subtitlesOverlayPath
          );

          return outputPath;
        });
      };

      const findClips = Effect.fn("findClips")(function* (opts: {
        inputVideo: AbsolutePath;
        mode: "entire-video" | "part-of-video";
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
          yield* Effect.log("[findClips] No good clips found");
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
          0
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
        inputVideo: AbsolutePath;
        clips: {
          startTime: number;
          duration: number;
        }[];
      }) => {
        return Effect.gen(function* () {
          const clips = yield* Effect.all(
            options.clips.map((clip) =>
              ffmpeg.createAudioClip(
                options.inputVideo,
                clip.startTime,
                clip.duration
              )
            ),
            {
              concurrency: "unbounded",
            }
          );

          const concatenatedAudio = yield* ffmpeg.concatenateAudioClips(clips);

          const normalizedAudio =
            yield* ffmpeg.normalizeAudio(concatenatedAudio);

          return normalizedAudio;
        });
      };

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
          const clipFiles = yield* Effect.all(
            clips.map((clip, i) =>
              Effect.gen(function* () {
                const outputFile = yield* ffmpeg.createVideoClip(
                  inputVideo,
                  clip.startTime,
                  clip.duration
                );

                yield* Effect.log(
                  `[createAutoEditedVideo] Created clip ${i + 1}/${clips.length}`
                );
                return outputFile;
              })
            ),
            {
              concurrency: "unbounded",
            }
          );

          yield* Effect.log("[createAutoEditedVideo] Concatenating clips");
          const concatenatedVideoPath =
            yield* ffmpeg.concatenateVideoClips(clipFiles);

          yield* Effect.log("[createAutoEditedVideo] Normalizing audio");

          const normalizedAudio = yield* ffmpeg.normalizeAudio(
            concatenatedVideoPath
          );

          return normalizedAudio;
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
            findClips({ inputVideo: opts.hostVideo, mode: "part-of-video" })
          );
          const guestClipsFork = yield* Effect.fork(
            findClips({ inputVideo: opts.guestVideo, mode: "part-of-video" })
          );

          const hostClips = yield* hostClipsFork;
          const guestClips = yield* guestClipsFork;

          const interviewSpeakingClips = rawClipsToInterviewSpeakingClips({
            hostClips: hostClips,
            guestClips: guestClips,
          });

          const clipFiles = yield* Effect.all(
            interviewSpeakingClips.map((clip, i) =>
              Effect.gen(function* () {
                // TODO: create clips to handle the case where the guest is speaking over the host
                const outputFile = yield* ffmpeg.createVideoClip(
                  clip.state === "host-speaking"
                    ? opts.hostVideo
                    : opts.guestVideo,
                  clip.startTime,
                  clip.duration
                );

                yield* Effect.log(
                  `[editInterviewWorkflow] Created clip ${i + 1}/${interviewSpeakingClips.length} of ${clip.state}`
                );
                return outputFile;
              })
            ),
            {
              concurrency: "unbounded",
            }
          );

          const concatenatedVideo =
            yield* ffmpeg.concatenateVideoClips(clipFiles);

          const normalizedAudio =
            yield* ffmpeg.normalizeAudio(concatenatedVideo);

          yield* fs.copyFile(normalizedAudio, opts.outputPath);
        }
      );

      const exportInterviewWorkflow = Effect.fn("exportInterviewWorkflow")(
        function* (opts: {
          hostVideo: AbsolutePath;
          guestVideo: AbsolutePath;
          outputJsonPath: AbsolutePath;
        }) {
          const hostClipsFork = yield* Effect.fork(
            findClips({ inputVideo: opts.hostVideo, mode: "part-of-video" })
          );
          const guestClipsFork = yield* Effect.fork(
            findClips({ inputVideo: opts.guestVideo, mode: "part-of-video" })
          );

          const hostClips = yield* hostClipsFork;
          const guestClips = yield* guestClipsFork;

          const interviewSpeakingClips = rawClipsToInterviewSpeakingClips({
            hostClips: hostClips,
            guestClips: guestClips,
          });

          const videoClips: VideoClip[] = interviewSpeakingClips.map((clip) => {
            return {
              sourceVideoPath:
                clip.state === "host-speaking"
                  ? opts.hostVideo
                  : opts.guestVideo,
              sourceVideoStartTime: clip.startTime,
              sourceVideoEndTime: clip.startTime + clip.duration,
            };
          });

          yield* fs.writeFileString(
            opts.outputJsonPath,
            JSON.stringify(videoClips, null, 2)
          );
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
          findClips({ inputVideo: opts.hostVideo, mode: "part-of-video" })
        );
        const guestClipsFork = yield* Effect.fork(
          findClips({ inputVideo: opts.guestVideo, mode: "part-of-video" })
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

      const createVideoFromClipsWorkflow = (
        options: CreateVideoFromClipsWorkflowOptions
      ) => {
        return Effect.gen(function* () {
          const outputVideoName = options.outputVideoName;

          const clips = yield* Effect.all(
            options.clips.map((clip, i) =>
              Effect.gen(function* () {
                const outputFile = yield* ffmpeg.createVideoClip(
                  clip.inputVideo as AbsolutePath,
                  clip.startTime,
                  clip.duration
                );

                yield* Effect.log(
                  `[createVideoFromClipsWorkflow] Created clip ${i + 1}/${options.clips.length}`
                );
                return outputFile;
              })
            ),
            {
              concurrency: "unbounded",
            }
          );

          const concatenatedVideo = yield* ffmpeg.concatenateVideoClips(clips);

          const normalizedAudio =
            yield* ffmpeg.normalizeAudio(concatenatedVideo);

          const outputPath = path.join(
            exportDirectory,
            `${outputVideoName}.mp4`
          ) as AbsolutePath;

          yield* fs.copyFile(normalizedAudio, outputPath);

          yield* Console.log(
            `✅ Successfully created video from clips: ${outputPath}`
          );

          return outputPath;
        });
      };

      const concatenateVideosWorkflow = (
        options: ConcatenateVideosWorkflowOptions
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

          yield* Effect.log(
            `[concatenateVideosWorkflow] Processing ${videoPaths.length} videos for concatenation`
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
                  trimmedDuration
                );

                const normalizedAudio =
                  yield* ffmpeg.normalizeAudio(outputFile);

                yield* Effect.log(
                  `[concatenateVideosWorkflow] Processed video ${index + 1}/${videoPaths.length}`
                );
                return normalizedAudio;
              })
            ),
            {
              concurrency: "unbounded",
            }
          );

          // Concatenate all processed clips
          yield* Effect.log("[concatenateVideosWorkflow] Concatenating videos");
          const concatenatedVideo =
            yield* ffmpeg.concatenateVideoClips(processedClips);

          yield* fs.copyFile(concatenatedVideo, outputPath);

          yield* Console.log(
            `✅ Successfully concatenated videos to: ${outputPath}`
          );

          return outputPath;
        });
      };

      return {
        createAutoEditedVideoWorkflow,
        createVideoFromClipsWorkflow,
        concatenateVideosWorkflow,
        editInterviewWorkflow,
        moveInterviewToDavinciResolve,
        exportInterviewWorkflow,
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
    const [exportFiles, shortsFiles] = yield* Effect.all(
      [
        fs.readDirectory(exportDirectory),
        fs.readDirectory(shortsExportDirectory),
      ],
      {
        concurrency: "unbounded",
      }
    );

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
        }),
      {
        concurrency: "unbounded",
      }
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
        }),
      {
        concurrency: "unbounded",
      }
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
    const queueUpdater = yield* QueueUpdaterService;
    const queueState = yield* queueUpdater.getQueueState();
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
}): InterviewSpeakingClip[] => {
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
