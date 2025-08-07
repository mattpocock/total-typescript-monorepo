import {
  runDavinciResolveScript,
  type AbsolutePath,
} from "@total-typescript/shared";
import { Config, Console, Effect } from "effect";
import path from "path";
import {
  extractBadTakeMarkersFromFile,
  isBadTake,
} from "./chapter-extraction.js";
import {
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
  SILENCE_DURATION,
  THRESHOLD,
} from "./constants.js";
import { FFmpegCommandsService } from "./ffmpeg-commands.js";
import { OBSIntegrationService } from "./services.js";
import { findSilenceInVideo } from "./silence-detection.js";

export interface AppendVideoToTimelineOptions {
  inputVideo?: AbsolutePath;
}

export interface AppendMultipleVideosToTimelineOptions {
  inputVideos: AbsolutePath[];
  clips: {
    startFrame: number;
    endFrame: number;
    videoIndex: number;
    timelineStartFrame?: number;
  }[];
}

export const serializeMultiTrackClipsForAppendScript = (
  clips: {
    startFrame: number;
    endFrame: number;
    videoIndex: number;
    timelineStartFrame?: number;
  }[]
) => {
  return clips
    .map((clip) => {
      const base = `${clip.startFrame}___${clip.endFrame}___${clip.videoIndex}`;
      return clip.timelineStartFrame !== undefined
        ? `${base}___${clip.timelineStartFrame}`
        : base;
    })
    .join(":::");
};

export const appendVideoToTimeline = (
  options: AppendVideoToTimelineOptions
) => {
  return Effect.gen(function* () {
    let inputVideo: AbsolutePath;

    const obs = yield* OBSIntegrationService;

    if (options.inputVideo) {
      inputVideo = path.resolve(options.inputVideo) as AbsolutePath;
    } else {
      inputVideo = yield* obs.getLatestOBSVideo();
    }

    const ffmpeg = yield* FFmpegCommandsService;

    const fps = yield* ffmpeg.getFPS(inputVideo);

    const [silenceResult, badTakeMarkers] = yield* Effect.all([
      findSilenceInVideo(inputVideo, {
        threshold: THRESHOLD,
        fps,
        startPadding: AUTO_EDITED_START_PADDING,
        endPadding: AUTO_EDITED_END_PADDING,
        silenceDuration: SILENCE_DURATION,
        ffmpeg,
      }),
      extractBadTakeMarkersFromFile(inputVideo, fps, ffmpeg),
    ]);

    const serialisedClipsOfSpeaking = serializeMultiTrackClipsForAppendScript(
      silenceResult.speakingClips
        .filter((clip, index) => {
          const takeQuality = isBadTake(
            clip,
            badTakeMarkers,
            index,
            silenceResult.speakingClips,
            fps
          );

          return takeQuality === "good";
        })
        .map((clip) => ({
          startFrame: clip.startFrame,
          endFrame: clip.endFrame,
          videoIndex: 0, // Single video goes on track 1
        }))
    );

    yield* runDavinciResolveScript("clip-and-append.lua", {
      INPUT_VIDEOS: inputVideo,
      CLIPS_TO_APPEND: serialisedClipsOfSpeaking,
      WSLENV: "INPUT_VIDEOS/p:CLIPS_TO_APPEND",
    });
  });
};

export const appendMultipleVideosToTimeline = (
  options: AppendMultipleVideosToTimelineOptions
) => {
  return Effect.gen(function* () {
    const serialisedClips = serializeMultiTrackClipsForAppendScript(
      options.clips
    );
    const inputVideosString = options.inputVideos.join(":::");

    yield* runDavinciResolveScript("clip-and-append.lua", {
      INPUT_VIDEOS: inputVideosString,
      CLIPS_TO_APPEND: serialisedClips,
      WSLENV: "INPUT_VIDEOS/p:CLIPS_TO_APPEND",
    });
  });
};

export const createTimeline = () => {
  return Effect.gen(function* () {
    const { stdout } = yield* runDavinciResolveScript(
      "create-timeline.lua",
      {}
    );

    yield* Console.log(stdout);
  }).pipe(
    Effect.catchAll((e) => {
      return Console.error(e);
    })
  );
};

export const addCurrentTimelineToRenderQueue = () => {
  return Effect.gen(function* () {
    const { stdout } = yield* runDavinciResolveScript(
      "add-timeline-to-render-queue.lua",
      {
        DAVINCI_EXPORT_DIRECTORY: yield* Config.string(
          "DAVINCI_EXPORT_DIRECTORY"
        ),
      }
    );

    yield* Effect.log(stdout);
  }).pipe(
    Effect.catchAll((e) => {
      return Effect.logError(e);
    })
  );
};

export const exportSubtitles = () => {
  return Effect.gen(function* () {
    const { stdout } = yield* runDavinciResolveScript("add-subtitles.lua", {
      OUTPUT_FOLDER: yield* Config.string("DAVINCI_EXPORT_DIRECTORY"),
    });

    yield* Effect.log(stdout);
  }).pipe(
    Effect.catchAll((e) => {
      return Effect.logError(e);
    })
  );
};

export const zoomClip = () => {
  return runDavinciResolveScript("zoom-clip.lua", {}).pipe(
    Effect.match({
      onSuccess: (r) => {
        console.log(r.stdout);
      },
      onFailure: (e) => {
        console.error(e);
      },
    })
  );
};
