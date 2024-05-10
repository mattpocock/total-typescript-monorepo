import {
  exitProcessWithError,
  runDavinciResolveScript,
} from "@total-typescript/shared";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import {
  ALLOWED_RAW_FPS_VALUES,
  CouldNotFindEndTimeError,
  CouldNotFindStartTimeError,
  PADDING,
  SILENCE_DURATION,
  THRESHOLD,
  findSilenceInVideo,
} from "@total-typescript/ffmpeg";

export const appendVideoToTimeline = async (fps: string) => {
  if (!ALLOWED_RAW_FPS_VALUES.includes(fps)) {
    exitProcessWithError(
      `FPS must be one of ${ALLOWED_RAW_FPS_VALUES.join(", ")}`,
    );
  }

  const fpsAsNumber = parseInt(fps, 10);

  const inputVideo = await getLatestOBSVideo();

  const silenceResult = await findSilenceInVideo(inputVideo, {
    threshold: THRESHOLD,
    fps: fpsAsNumber,
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
