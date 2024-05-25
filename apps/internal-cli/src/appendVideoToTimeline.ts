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

export const appendVideoToTimeline = async () => {
  const inputVideo = await getLatestOBSVideo();

  const fps = await getFPS(inputVideo);

  const silenceResult = await findSilenceInVideo(inputVideo, {
    threshold: THRESHOLD,
    fps,
    padding: PADDING,
    silenceDuration: SILENCE_DURATION,
  });

  if (silenceResult instanceof CouldNotFindStartTimeError) {
    exitProcessWithError("Could not find start time");
  }

  if (silenceResult instanceof CouldNotFindEndTimeError) {
    exitProcessWithError("Could not find end time");
  }

  const serialisedClipsOfSpeaking = silenceResult.allSpeakingClips
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
