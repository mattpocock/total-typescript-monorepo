import { openai } from "@ai-sdk/openai";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { generateObject } from "ai";
import { Config, Data, Effect } from "effect";
import { OpenAIService, ReadStreamService } from "./services.js";

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

export class FFmpegCommandsService extends Effect.Service<FFmpegCommandsService>()(
  "FFmpegCommandsService",
  {
    effect: Effect.gen(function* () {
      const openaiService = yield* OpenAIService;
      const { createReadStream } = yield* ReadStreamService;

      return {
        createSubtitleFromAudio: Effect.fn("createSubtitleFromAudio")(
          function* (audioPath: AbsolutePath) {
            const stream = yield* createReadStream(audioPath);

            const response = yield* Effect.tryPromise(async () => {
              return openaiService.audio.transcriptions.create({
                file: stream,
                model: "whisper-1",
                response_format: "verbose_json",
                timestamp_granularities: ["segment", "word"],
              });
            }).pipe(
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
          const audioExtension = yield* Config.string("AUDIO_FILE_EXTENSION");

          if (!audioPath.endsWith(audioExtension)) {
            return yield* Effect.fail(
              new WrongAudioFileExtensionError({
                message: `Audio file extension must be ${audioExtension}`,
              })
            );
          }

          const stream = yield* createReadStream(audioPath);

          const response = yield* Effect.tryPromise(async () => {
            return openaiService.audio.transcriptions.create({
              file: stream,
              model: "whisper-1",
            });
          }).pipe(
            Effect.mapError((e) => {
              return new CouldNotTranscribeAudioError({
                cause: e,
              });
            })
          );

          return response.text;
        }),

        getFPS: Effect.fn("getFPS")(function* (inputVideo: AbsolutePath) {
          return yield* execAsync(
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
          return yield* execAsync(
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
          return yield* execAsync(
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
          return yield* execAsync(
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

        encodeVideo: Effect.fn("encodeVideo")(function* (
          inputVideo: AbsolutePath,
          outputVideoPath: AbsolutePath
        ) {
          return yield* execAsync(
            `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`
          ).pipe(
            Effect.mapError((e) => {
              return new CouldNotEncodeVideoError({
                cause: e,
              });
            })
          );
        }),

        formatFloatForFFmpeg: Effect.fn("formatFloatForFFmpeg")(function* (
          num: number
        ) {
          return num.toFixed(3);
        }),

        trimVideo: Effect.fn("trimVideo")(function* (
          inputVideo: AbsolutePath,
          outputVideo: AbsolutePath,
          startTime: number,
          endTime: number
        ) {
          const formatFloat = yield* Effect.sync(
            () => (num: number) => num.toFixed(3)
          );

          return yield* execAsync(
            `ffmpeg -y -hide_banner -ss ${formatFloat(startTime)} -to ${formatFloat(endTime)} -i "${inputVideo}" -c copy "${outputVideo.replaceAll("\\", "")}"`
          );
        }),

        convertToWav: Effect.fn("convertToWav")(function* (
          inputPath: AbsolutePath,
          outputPath: AbsolutePath
        ) {
          return yield* execAsync(
            `ffmpeg -i ${inputPath} -ar 16000 -ac 1 -c:a pcm_s16le ${outputPath}`
          );
        }),

        normalizeAudio: Effect.fn("normalizeAudio")(function* (
          input: AbsolutePath,
          output: AbsolutePath
        ) {
          return yield* execAsync(
            `ffmpeg -y -i "${input}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" "${output}"`
          );
        }),

        extractAudioFromVideo: Effect.fn("extractAudioFromVideo")(function* (
          inputPath: AbsolutePath,
          outputPath: AbsolutePath,
          opts?: {
            startTime?: number;
            endTime?: number;
          }
        ) {
          return yield* execAsync(
            `nice -n 19 ffmpeg -y -hide_banner -hwaccel cuda -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}" ${opts?.startTime ? `-ss ${opts.startTime}` : ""} ${opts?.endTime ? `-t ${opts.endTime}` : ""}`
          ).pipe(
            Effect.mapError((e) => {
              return new CouldNotExtractAudioError({
                cause: e,
              });
            })
          );
        }),

        createClip: Effect.fn("createClip")(function* (
          inputVideo: AbsolutePath,
          outputFile: AbsolutePath,
          startTime: number,
          duration: number
        ) {
          return yield* execAsync(
            `nice -n 19 ffmpeg -y -hide_banner -ss ${startTime} -i "${inputVideo}" -t ${duration} -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputFile}"`
          ).pipe(
            Effect.mapError((e) => {
              return new CouldNotCreateClipError({
                cause: e,
              });
            })
          );
        }),

        concatenateClips: Effect.fn("concatenateClips")(function* (
          concatFile: AbsolutePath,
          outputVideo: AbsolutePath
        ) {
          return yield* execAsync(
            `nice -n 19 ffmpeg -y -hide_banner -f concat -safe 0 -i "${concatFile}" -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputVideo}"`
          );
        }),

        overlaySubtitles: Effect.fn("overlaySubtitles")(function* (
          inputPath: AbsolutePath,
          subtitlesOverlayPath: AbsolutePath,
          outputPath: AbsolutePath
        ) {
          return yield* execAsync(
            `nice -n 19 ffmpeg -y -i "${inputPath}" -i "${subtitlesOverlayPath}" -filter_complex "[0:v][1:v]overlay" -c:a copy "${outputPath}"`
          );
        }),

        detectSilence: Effect.fn("detectSilence")(function* (
          inputVideo: AbsolutePath,
          threshold: number | string,
          silenceDuration: number | string
        ) {
          return yield* execAsync(
            `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${threshold}dB:d=${silenceDuration}" -f null - 2>&1`
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

        renderRemotion: Effect.fn("renderRemotion")(function* (
          outputPath: AbsolutePath,
          cwd: string
        ) {
          return yield* execAsync(
            `nice -n 19 npx remotion render MyComp "${outputPath}"`,
            {
              cwd,
            }
          );
        }),
      };
    }),
    dependencies: [OpenAIService.Default, ReadStreamService.Default],
  }
) {}
