import {
  SILENCE_DURATION,
  THRESHOLD,
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
  extractBadTakeMarkersFromFile,
  findSilenceInVideo,
  getFPS,
  isBadTake,
} from "@total-typescript/ffmpeg";
import {
  runDavinciResolveScript,
  type AbsolutePath,
} from "@total-typescript/shared";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import path from "path";
import { Effect } from "effect";

export const appendVideoToTimeline = async (video: string | undefined) => {
  return Effect.gen(function* () {
    let inputVideo: AbsolutePath;

    if (video) {
      inputVideo = path.resolve(video) as AbsolutePath;
    } else {
      inputVideo = yield* getLatestOBSVideo();
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

    return Effect.succeed(void 0);
  });
};
