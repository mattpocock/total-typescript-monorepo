import { Effect } from "effect";
import { FFmpegCommandsService } from "../ffmpeg-commands.js";
import type { AbsolutePath } from "@total-typescript/shared";
import { SILENCE_DURATION, THRESHOLD } from "../constants.js";
import { findSilenceInVideo } from "../silence-detection.js";
import { FileSystem } from "@effect/platform";
import path from "node:path";

export type RawVideoMetadata = {
  id: string;
  /**
   * Input video path
   *
   * Relative to the base of the raw-videos directory
   */
  videoPath: string;
  clips: RawVideoSpeakingClip[];
  fps: number;
  resolution: {
    widthInPixels: number;
    heightInPixels: number;
  };
};

export type RawVideoSpeakingClip = {
  readonly id: string;
  /**
   * The path to the video file
   */
  videoPath: string;
  /**
   * The start time of the speaking clip in seconds
   */
  startTimeInSeconds: number;
  /**
   * The end time of the speaking clip in seconds
   */
  endTimeInSeconds: number;
  /**
   * The transcription of the speaking clip
   */
  transcript: string;
  /**
   * The timestamp at which the speaking clip was deleted
   */
  deleted: boolean;
};

export interface RawVideoSpeakingClipWithFrontendMetadata
  extends RawVideoSpeakingClip {
  /**
   * Using a levenshtein distance algorithm,
   * this is the similarity score between the
   * transcript of the current clip and the
   * transcript of the next clip in the timeline
   *
   * Between 0 and 1, where 0 is no similarity
   * and 1 is identical
   */
  textualSimilarityToNextClip: number;
}

export const createMetadataForRawVideo = Effect.fn("createMetadataForRawVideo")(
  function* (rawVideoPath: AbsolutePath) {
    const ffmpeg = yield* FFmpegCommandsService;
    const fs = yield* FileSystem.FileSystem;

    const fpsFork = yield* Effect.fork(ffmpeg.getFPS(rawVideoPath));

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

    const { speakingClips } = yield* findSilenceInVideo(rawVideoPath, {
      threshold: THRESHOLD,
      silenceDuration: SILENCE_DURATION,
      startPadding: 0,
      endPadding: 0,
      fps: yield* fpsFork,
      ffmpeg,
    });

    const tmpDir = yield* fs.makeTempDirectoryScoped();

    yield* Effect.addFinalizer(() => {
      return fs
        .remove(tmpDir, {
          recursive: true,
          force: true,
        })
        .pipe(Effect.orDie);
    });

    const audioFiles = yield* Effect.all(
      speakingClips.map((clipLength, index) => {
        return Effect.gen(function* () {
          const audioPath = path.join(
            tmpDir,
            `audio-${index}.mp3`
          ) as AbsolutePath;

          yield* ffmpeg.extractAudioFromVideo(rawVideoPath, audioPath, {
            startTime: clipLength.startTime,
            endTime: clipLength.endTime,
          });

          return {
            audioPath,
            startTime: clipLength.startTime,
            endTime: clipLength.endTime,
          };
        });
      }),
      {
        concurrency: "unbounded",
      }
    );

    const transcriptSegments = yield* Effect.all(
      audioFiles.map((audioFile) => {
        return Effect.gen(function* () {
          const transcript = yield* ffmpeg.transcribeAudio(audioFile.audioPath);

          return {
            audioPath: audioFile.audioPath,
            startTime: audioFile.startTime,
            endTime: audioFile.endTime,
            transcript,
          };
        });
      }),
      {
        concurrency: "unbounded",
      }
    );

    const metadata: RawVideoMetadata = {
      id: rawVideoPath,
      videoPath: rawVideoPath,
      fps: yield* fpsFork,
      resolution: yield* resolutionFork,
      clips: transcriptSegments.map((segment) => {
        return {
          id: segment.audioPath,
          videoPath: segment.audioPath,
          startTimeInSeconds: segment.startTime,
          endTimeInSeconds: segment.endTime,
          transcript: segment.transcript,
          deleted: false,
        };
      }),
    };

    return metadata;
  },

  Effect.scoped
);
