import {
  SILENCE_DURATION,
  THRESHOLD,
  extractBadTakeMarkersFromFile,
  findSilenceInVideo,
  getFPS,
  isBadTake,
} from "@total-typescript/ffmpeg";
import { runDavinciResolveScript } from "@total-typescript/shared";
import { okAsync, safeTry } from "neverthrow";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";

export const appendVideoToTimeline = async (
  mode: "new-timeline" | "current-timeline"
) => {
  return safeTry(async function* () {
    const inputVideo = yield* getLatestOBSVideo();

    const fps = yield* getFPS(inputVideo);

    const silenceResult = yield* findSilenceInVideo(inputVideo, {
      threshold: THRESHOLD,
      fps,
      startPadding: 0,
      endPadding: 0.05,
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
        NEW_TIMELINE: mode === "new-timeline" ? "true" : "false",
      }
    );

    console.log(stdout, stderr);

    return okAsync(void 0);
  }).mapErr((e) => {
    console.error(e);
    process.exit(1);
  });
};
