import {
  SILENCE_DURATION,
  THRESHOLD,
  findSilenceInVideo,
  getFPS,
} from "@total-typescript/ffmpeg";
import { runDavinciResolveScript } from "@total-typescript/shared";
import { writeFileSync } from "fs";
import { okAsync, safeTry } from "neverthrow";
import path from "path";
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

    const textFileOutput = path.resolve(
      inputVideo.replace(".mkv", ".silence.txt")
    );

    writeFileSync(textFileOutput, silenceResult.rawStdout);

    const serialisedClipsOfSpeaking = silenceResult.speakingClips
      .map((clip) => {
        return `${clip.startFrame}___${clip.endFrame}`;
      })
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
