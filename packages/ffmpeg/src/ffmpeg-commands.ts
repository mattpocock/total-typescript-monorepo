import { openai } from "@ai-sdk/openai";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { generateObject } from "ai";
import { Config, Data, Effect } from "effect";
import { OpenAIService, ReadStreamService } from "./services.js";
import {
  FFMPEG_CONCURRENCY_LIMIT,
  TRANSCRIPTION_CONCURRENCY_LIMIT,
} from "./constants.js";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import path, { join } from "node:path";
import { REMOTION_DIR } from "./subtitle-rendering.js";

// Error classes
export class CouldNotTranscribeAudioError extends Data.TaggedError(
  "CouldNotTranscribeAudioError"
)<{
  cause: Error;
}> {}

export class WrongAudioFileExtensionError extends Data.TaggedError(
  "WrongAudioFileExtensionError"
)<{
  message: string;
}> {}

export class CouldNotEncodeVideoError extends Data.TaggedError(
  "CouldNotEncodeVideoError"
)<{
  cause: Error;
}> {}

export class CouldNotGetFPSError extends Data.TaggedError(
  "CouldNotGetFPSError"
)<{
  cause: Error;
}> {}

export class CouldNotExtractChaptersError extends Data.TaggedError(
  "CouldNotExtractChaptersError"
)<{
  cause: Error;
}> {}

export class CouldNotExtractAudioError extends Data.TaggedError(
  "CouldNotExtractAudioError"
)<{
  cause: Error;
}> {}

export class CouldNotCreateClipError extends Data.TaggedError(
  "CouldNotCreateClipError"
)<{
  cause: Error;
}> {}

export class CouldNotDetectSilenceError extends Data.TaggedError(
  "CouldNotDetectSilenceError"
)<{
  cause: Error;
}> {}

export class CouldNotFigureOutWhichCTAToShowError extends Data.TaggedError(
  "CouldNotFigureOutWhichCTAToShowError"
)<{
  cause: Error;
}> {}

export class CouldNotCreateAudioClipError extends Data.TaggedError(
  "CouldNotCreateAudioClipError"
)<{
  cause: Error;
}> {}

// Interfaces
export interface RawChapter {
  id: number;
  time_base: string;
  start: number;
  start_time: string;
  end: number;
  end_time: string;
  tags: {
    title: string;
  };
}

export interface ChaptersResponse {
  chapters: RawChapter[];
}

const AUDIO_EXTENSION = "mp3";

export class FFmpegCommandsService extends Effect.Service<FFmpegCommandsService>()(
  "FFmpegCommandsService",
  {
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const openaiService = yield* OpenAIService;
      const { createReadStream } = yield* ReadStreamService;

      const gpuAcceleratedMutex = yield* Effect.makeSemaphore(
        FFMPEG_CONCURRENCY_LIMIT
      );
      const cpuMutex = yield* Effect.makeSemaphore(12);
      const transcriptionMutex = yield* Effect.makeSemaphore(
        TRANSCRIPTION_CONCURRENCY_LIMIT
      );
      const remotionMutex = yield* Effect.makeSemaphore(1);

      const runGPULimitsAwareCommand = (command: string) => {
        return gpuAcceleratedMutex.withPermits(1)(execAsync(command));
      };

      const runCPULimitsAwareCommand = (command: string) => {
        return cpuMutex.withPermits(1)(execAsync(command));
      };

      return {
        createSubtitleFromAudio: Effect.fn("createSubtitleFromAudio")(
          function* (audioPath: AbsolutePath) {
            const stream = yield* createReadStream(audioPath);

            const response = yield* transcriptionMutex
              .withPermits(1)(
                Effect.tryPromise(async () => {
                  return openaiService.audio.transcriptions.create({
                    file: stream,
                    model: "whisper-1",
                    response_format: "verbose_json",
                    timestamp_granularities: ["segment", "word"],
                  });
                })
              )
              .pipe(
                Effect.mapError((e) => {
                  return new CouldNotTranscribeAudioError({
                    cause: e,
                  });
                })
              );

            return {
              segments: response.segments!.map((segment) => ({
                start: segment.start,
                end: segment.end,
                text: segment.text,
              })),
              words: response.words!.map((word) => ({
                start: word.start,
                end: word.end,
                text: word.word,
              })),
            };
          }
        ),

        transcribeAudio: Effect.fn("transcribeAudio")(function* (
          audioPath: AbsolutePath
        ) {
          if (!audioPath.endsWith(AUDIO_EXTENSION)) {
            return yield* Effect.fail(
              new WrongAudioFileExtensionError({
                message: `Audio file extension must be ${AUDIO_EXTENSION}`,
              })
            );
          }

          const stream = yield* createReadStream(audioPath);

          const response = yield* transcriptionMutex
            .withPermits(1)(
              Effect.tryPromise(async () => {
                return openaiService.audio.transcriptions.create({
                  file: stream,
                  model: "whisper-1",
                });
              })
            )
            .pipe(
              Effect.mapError((e) => {
                return new CouldNotTranscribeAudioError({
                  cause: e,
                });
              })
            );

          return response.text;
        }),

        getFPS: Effect.fn("getFPS")(function* (inputVideo: AbsolutePath) {
          return yield* runCPULimitsAwareCommand(
            `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
          ).pipe(
            Effect.map((output) => {
              const [numerator, denominator] = output.stdout.split("/");
              return Number(numerator) / Number(denominator);
            }),
            Effect.mapError((e) => {
              return new CouldNotGetFPSError({
                cause: e,
              });
            })
          );
        }),

        getResolution: Effect.fn("getResolution")(function* (
          inputVideo: AbsolutePath
        ) {
          return yield* runCPULimitsAwareCommand(
            `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${inputVideo}"`
          ).pipe(
            Effect.map(
              (
                output
              ): {
                width: number;
                height: number;
              } => {
                const { width, height } = JSON.parse(output.stdout);
                return { width, height };
              }
            )
          );
        }),

        getVideoDuration: Effect.fn("getVideoDuration")(function* (
          inputVideo: AbsolutePath
        ) {
          return yield* runCPULimitsAwareCommand(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
          ).pipe(
            Effect.map((output) => {
              return Number(output.stdout);
            })
          );
        }),

        getChapters: Effect.fn("getChapters")(function* (
          inputVideo: AbsolutePath
        ) {
          return yield* runCPULimitsAwareCommand(
            `ffprobe -i "${inputVideo}" -show_chapters -v quiet -print_format json`
          ).pipe(
            Effect.map(({ stdout }) => {
              return JSON.parse(stdout.trim()) as ChaptersResponse;
            }),
            Effect.mapError(
              (e) => new CouldNotExtractChaptersError({ cause: e })
            )
          );
        }),

        formatFloatForFFmpeg: Effect.fn("formatFloatForFFmpeg")(function* (
          num: number
        ) {
          return num.toFixed(3);
        }),

        trimVideo: Effect.fn("trimVideo")(function* (
          inputVideo: AbsolutePath,
          startTime: number,
          endTime: number
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();
          const outputVideo = path.join(tempDir, "trimmed.mp4") as AbsolutePath;

          const formatFloat = yield* Effect.sync(
            () => (num: number) => num.toFixed(3)
          );

          yield* runCPULimitsAwareCommand(
            `ffmpeg -y -hide_banner -ss ${formatFloat(startTime)} -to ${formatFloat(endTime)} -i "${inputVideo}" -c copy "${outputVideo}"`
          );

          return outputVideo;
        }),

        normalizeAudio: Effect.fn("normalizeAudio")(function* (
          input: AbsolutePath
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();
          const outputFile = path.join(
            tempDir,
            `normalized${path.extname(input)}`
          ) as AbsolutePath;

          yield* runCPULimitsAwareCommand(
            `ffmpeg -y -i "${input}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" "${outputFile}"`
          );

          return outputFile;
        }),

        extractAudioFromVideo: Effect.fn("extractAudioFromVideo")(function* (
          inputPath: AbsolutePath,
          opts?: {
            startTime?: number;
            endTime?: number;
          }
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();

          const outputPath = path.join(
            tempDir,
            `extracted-audio.${AUDIO_EXTENSION}`
          ) as AbsolutePath;

          return yield* runCPULimitsAwareCommand(
            `nice -n 19 ffmpeg -y -hide_banner -hwaccel cuda -i "${inputPath}" -vn -c:a copy "${outputPath}" ${opts?.startTime ? `-ss ${opts.startTime}` : ""} ${opts?.endTime ? `-t ${opts.endTime}` : ""}`
          ).pipe(
            Effect.mapError((e) => {
              return new CouldNotExtractAudioError({
                cause: e,
              });
            }),
            Effect.map(() => outputPath)
          );
        }),

        createAudioClip: Effect.fn("createAudioClip")(function* (
          inputAudio: AbsolutePath,
          startTime: number,
          duration: number
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();

          const outputPath = path.join(
            tempDir,
            `clip.${AUDIO_EXTENSION}`
          ) as AbsolutePath;
          return yield* runCPULimitsAwareCommand(
            `nice -n 19 ffmpeg -y -hide_banner -hwaccel cuda -ss ${startTime} -i "${inputAudio}" -t ${duration} -c:a libmp3lame -b:a 384k "${outputPath}"`
          ).pipe(
            Effect.mapError((e) => {
              return new CouldNotCreateAudioClipError({
                cause: e,
              });
            }),
            Effect.map(() => outputPath)
          );
        }),

        createVideoClip: Effect.fn("createVideoClip")(function* (
          inputVideo: AbsolutePath,
          startTime: number,
          duration: number
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();
          const outputFile = path.join(
            tempDir,
            `clip.${path.extname(inputVideo)}`
          ) as AbsolutePath;

          yield* runGPULimitsAwareCommand(
            `nice -n 19 ffmpeg -y -hide_banner -ss ${startTime} -i "${inputVideo}" -t ${duration} -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputFile}"`
          ).pipe(
            Effect.mapError((e) => {
              return new CouldNotCreateClipError({
                cause: e,
              });
            })
          );

          return outputFile;
        }),

        concatenateVideoClips: Effect.fn("concatenateVideoClips")(function* (
          clipFiles: AbsolutePath[]
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();

          const concatFile = join(tempDir, "concat.txt") as AbsolutePath;
          const concatContent = clipFiles
            .map((file: string) => `file '${file}'`)
            .join("\n");

          const outputVideo = path.join(
            tempDir,
            `concatenated-video.mp4`
          ) as AbsolutePath;

          yield* fs.writeFileString(concatFile, concatContent);

          yield* runGPULimitsAwareCommand(
            `ffmpeg -y -hide_banner -f concat -safe 0 -i "${concatFile}" -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputVideo}"`
          );

          return outputVideo;
        }),

        concatenateAudioClips: Effect.fn("concatenateAudioClips")(function* (
          clipFiles: AbsolutePath[]
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();

          const concatFile = join(tempDir, "concat.txt") as AbsolutePath;
          const concatContent = clipFiles
            .map((file: string) => `file '${file}'`)
            .join("\n");

          yield* fs.writeFileString(concatFile, concatContent);

          const outputAudio = path.join(
            tempDir,
            `concatenated-audio.${AUDIO_EXTENSION}`
          ) as AbsolutePath;

          return yield* runCPULimitsAwareCommand(
            `nice -n 19 ffmpeg -y -hide_banner -f concat -safe 0 -i "${concatFile}" -c:a libmp3lame -b:a 384k "${outputAudio}"`
          ).pipe(Effect.map(() => outputAudio));
        }),

        overlaySubtitles: Effect.fn("overlaySubtitles")(function* (
          inputPath: AbsolutePath,
          subtitlesOverlayPath: AbsolutePath
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();
          const outputPath = path.join(
            tempDir,
            `with-subtitles.mp4`
          ) as AbsolutePath;

          yield* runCPULimitsAwareCommand(
            `nice -n 19 ffmpeg -y -i "${inputPath}" -i "${subtitlesOverlayPath}" -filter_complex "[0:v][1:v]overlay" -c:a copy "${outputPath}"`
          );

          return outputPath;
        }),

        detectSilence: Effect.fn("detectSilence")(function* (
          inputVideo: AbsolutePath,
          threshold: number | string,
          silenceDuration: number | string,
          startTime?: number
        ) {
          return yield* runCPULimitsAwareCommand(
            `ffmpeg -hide_banner -vn ${startTime ? `-ss "${startTime}"` : ""} -i "${inputVideo}" -af "silencedetect=n=${threshold}dB:d=${silenceDuration}" -f null - 2>&1`
          ).pipe(
            Effect.mapError((e) => {
              return new CouldNotDetectSilenceError({
                cause: e,
              });
            })
          );
        }),

        figureOutWhichCTAToShow: Effect.fn("figureOutWhichCTAToShow")(
          function* (transcript: string) {
            return yield* Effect.tryPromise({
              try: async (signal) => {
                const { object } = await generateObject({
                  model: openai("gpt-4o-mini"),
                  output: "enum",
                  enum: ["ai", "typescript"],
                  system: `
                You are deciding which call to action to use for a video.
                The call to action will either point to totaltypescript.com, or aihero.dev.
                Return "ai" if the video is best suited for aihero.dev, and "typescript" if the video is best suited for totaltypescript.com.
                You will receive the full transcript of the video.
          
                If the video mentions AI, return "ai".
                Or if the video mentions TypeScript, return "typescript".
                If the video mentions Node, return "typescript".
                If the video mentions React, return "typescript".
                
              `,
                  prompt: transcript,
                  abortSignal: signal,
                });

                return object;
              },
              catch: (e) => {
                return new CouldNotFigureOutWhichCTAToShowError({
                  cause: e as Error,
                });
              },
            });
          }
        ),

        combineAudioAndVideo: Effect.fn("combineAudioAndVideo")(function* (
          audioPath: AbsolutePath,
          videoPath: AbsolutePath
        ) {
          const tempDir = yield* fs.makeTempDirectoryScoped();
          const outputPath = path.join(tempDir, "combined.mp4") as AbsolutePath;

          return yield* runCPULimitsAwareCommand(
            `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a copy -map 0:v:0 -map 1:a:0 "${outputPath}"`
          ).pipe(Effect.map(() => outputPath));
        }),

        renderRemotion: Effect.fn("renderRemotion")(function* (meta: {
          subtitles: {
            startFrame: number;
            endFrame: number;
            text: string;
          }[];
          cta: "ai" | "typescript";
          ctaDurationInFrames: number;
          durationInFrames: number;
        }) {
          const META_FILE_PATH = path.join(REMOTION_DIR, "src", "meta.json");
          yield* fs.writeFileString(META_FILE_PATH, JSON.stringify(meta));
          const tempDir = yield* fs.makeTempDirectoryScoped();
          const outputPath = path.join(tempDir, "remotion.mov") as AbsolutePath;

          yield* remotionMutex.withPermits(1)(
            execAsync(`npx remotion render MyComp "${outputPath}"`, {
              cwd: REMOTION_DIR,
            })
          );

          return outputPath;
        }),
      };
    }),
    dependencies: [
      OpenAIService.Default,
      ReadStreamService.Default,
      NodeFileSystem.layer,
    ],
  }
) {}
