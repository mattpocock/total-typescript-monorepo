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
import { FFmpegCommandsService, OBSIntegrationService } from "./services.js";
import { findSilenceInVideo } from "./silence-detection.js";

export interface AppendVideoToTimelineOptions {
  inputVideo?: AbsolutePath;
}

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

    const serialisedClipsOfSpeaking = silenceResult.speakingClips
      .map((clip, index) => {
        const takeQuality = isBadTake(
          clip,
          badTakeMarkers,
          index,
          silenceResult.speakingClips,
          fps
        );
        return {
          clip,
          takeQuality,
          serialized: `${clip.startFrame}___${clip.endFrame}___${takeQuality === "maybe-bad" ? "1" : "0"}`,
        };
      })
      .filter(({ takeQuality }) => takeQuality !== "definitely-bad")
      .map(({ serialized }) => serialized)
      .join(":::");

    yield* runDavinciResolveScript("clip-and-append.lua", {
      INPUT_VIDEO: inputVideo,
      CLIPS_TO_APPEND: serialisedClipsOfSpeaking,
      WSLENV: "INPUT_VIDEO/p:CLIPS_TO_APPEND",
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
