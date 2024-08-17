import {
  CouldNotFindEndTimeError,
  CouldNotFindStartTimeError,
  PADDING,
  SILENCE_DURATION,
  THRESHOLD,
  findSilenceInVideo,
  getFPS,
} from "@total-typescript/ffmpeg";
import {
  exitProcessWithError,
  runDavinciResolveScript,
} from "@total-typescript/shared";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import path from "path";
import { writeFileSync } from "fs";
import { okAsync, safeTry } from "neverthrow";
import { ok } from "assert";

export const appendVideoToTimeline = async () => {
  return safeTry(async function* () {
    const inputVideo = yield* getLatestOBSVideo().safeUnwrap();

    const fps = yield* getFPS(inputVideo).safeUnwrap();

    const silenceResult = yield* findSilenceInVideo(inputVideo, {
      threshold: THRESHOLD,
      fps,
      padding: 0,
      silenceDuration: SILENCE_DURATION,
    }).safeUnwrap();

    const textFileOutput = path.resolve(
      inputVideo.replace(".mp4", ".silence.txt"),
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
  });
};

export const appendVideoToTimeline2 = async () => {
  const inputVideo = await getLatestOBSVideo();

  const fps = await getFPS(inputVideo);

  const silenceResult = await findSilenceInVideo(inputVideo, {
    threshold: THRESHOLD,
    fps,
    padding: 0,
    silenceDuration: SILENCE_DURATION,
  });

  if (silenceResult instanceof CouldNotFindStartTimeError) {
    exitProcessWithError("Could not find start time");
  }

  if (silenceResult instanceof CouldNotFindEndTimeError) {
    exitProcessWithError("Could not find end time");
  }

  const textFileOutput = path.resolve(
    inputVideo.replace(".mp4", ".silence.txt"),
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
};
