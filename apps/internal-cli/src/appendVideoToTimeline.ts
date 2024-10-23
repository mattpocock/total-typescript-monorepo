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

export const appendVideoToTimeline = async () => {
  return safeTry(async function* () {
    const inputVideo = yield* getLatestOBSVideo();

    const fps = yield* getFPS(inputVideo);

    const silenceResult = yield* findSilenceInVideo(inputVideo, {
      threshold: THRESHOLD,
      fps,
      padding: 0,
      silenceDuration: SILENCE_DURATION,
    });

    const textFileOutput = path.resolve(
      inputVideo.replace(".mp4", ".silence.txt")
    );

    writeFileSync(textFileOutput, silenceResult.rawStdout);

    const serialisedClipsOfSpeaking = silenceResult.speakingClips
      .map((clip) => {
        return `${clip.startFrame}___${clip.endFrame}`;
      })
      .join(":::");

    console.log("Appending to Timeline");

    await runDavinciResolveScript("clip-and-append.lua", {
      INPUT_VIDEO: inputVideo,
      CLIPS_TO_APPEND: serialisedClipsOfSpeaking,
    });

    return okAsync(void 0);
  }).mapErr((e) => {
    console.error(e);
    process.exit(1);
  });
};
