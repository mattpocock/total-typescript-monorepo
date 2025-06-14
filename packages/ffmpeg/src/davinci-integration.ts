import {
  runDavinciResolveScript,
  type AbsolutePath,
} from "@total-typescript/shared";
import { okAsync, ResultAsync, safeTry } from "neverthrow";
import path from "path";
import {
  SILENCE_DURATION,
  THRESHOLD,
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
} from "./constants.js";
import {
  extractBadTakeMarkersFromFile,
  isBadTake,
} from "./chapter-extraction.js";
import { findSilenceInVideo } from "./silence-detection.js";
import { getFPS } from "./video-processing.js";

export interface AppendVideoToTimelineOptions {
  inputVideo?: AbsolutePath;
  getLatestOBSVideo: () => ResultAsync<AbsolutePath, Error>;
}

export const appendVideoToTimeline = async (
  options: AppendVideoToTimelineOptions
) => {
  return safeTry(async function* () {
    let inputVideo: AbsolutePath;

    if (options.inputVideo) {
      inputVideo = path.resolve(options.inputVideo) as AbsolutePath;
    } else {
      const result = await options.getLatestOBSVideo();
      if (result.isErr()) {
        throw result.error;
      }
      inputVideo = result.value!;
    }

    const fps = yield* getFPS(inputVideo);

    const silenceResult = yield* findSilenceInVideo(inputVideo, {
      threshold: THRESHOLD,
      fps,
      startPadding: AUTO_EDITED_START_PADDING,
      endPadding: AUTO_EDITED_END_PADDING,
      silenceDuration: SILENCE_DURATION,
    });

    const badTakeMarkers = yield* extractBadTakeMarkersFromFile(
      inputVideo,
      fps
    );

    console.dir(badTakeMarkers, { depth: null });
    console.dir(silenceResult.speakingClips, { depth: null });

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

    const { stdout, stderr } = yield* runDavinciResolveScript(
      "clip-and-append.lua",
      {
        INPUT_VIDEO: inputVideo,
        CLIPS_TO_APPEND: serialisedClipsOfSpeaking,
        WSLENV: "INPUT_VIDEO/p:CLIPS_TO_APPEND",
      }
    );

    console.log(stdout, stderr);

    return okAsync(void 0);
  }).mapErr((e) => {
    console.error(e);
    process.exit(1);
  });
};

export interface DavinciWorkflowOptions {
  davinciExportDirectory: string;
}

export const createTimeline = async () => {
  return runDavinciResolveScript("create-timeline.lua", {}).match(
    (r) => {
      console.log(r.stdout);
    },
    (e) => {
      console.error(e);
    }
  );
};

export const addCurrentTimelineToRenderQueue = async (
  options: DavinciWorkflowOptions
) => {
  return runDavinciResolveScript("add-timeline-to-render-queue.lua", {
    DAVINCI_EXPORT_DIRECTORY: options.davinciExportDirectory,
  }).match(
    (r) => {
      console.log(r.stdout);
    },
    (e) => {
      console.error(e);
    }
  );
};

export const exportSubtitles = async (options: DavinciWorkflowOptions) => {
  return runDavinciResolveScript("add-subtitles.lua", {
    OUTPUT_FOLDER: options.davinciExportDirectory,
  }).match(
    (r) => {
      console.log(r.stdout);
    },
    (e) => {
      console.error(e);
    }
  );
};

export const zoomClip = async () => {
  return runDavinciResolveScript("zoom-clip.lua", {}).match(
    (r) => {
      console.log(r.stdout);
    },
    (e) => {
      console.error(e);
    }
  );
};
