import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { getClipsOfSpeakingFromFFmpeg } from "./getSpeakingClips.js";

export const encodeVideo = async (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath,
) => {
  await execAsync(
    `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`,
  );
};

export class CouldNotFindStartTimeError {
  readonly _tag = "CouldNotFindStartTimeError";
}

export class CouldNotFindEndTimeError {
  readonly _tag = "CouldNotFindEndTimeError";
}

export const findSilenceInVideo = async (
  inputVideo: AbsolutePath,
  opts: {
    fps: number;
    threshold: number | string;
    silenceDuration: number | string;
    padding: number;
  },
) => {
  const output = await execAsync(
    `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${opts.threshold}dB:d=${opts.silenceDuration}" -f null - 2>&1 | grep "silence_end" | awk '{print $5 " " $8}'`,
  );

  const speakingClips = getClipsOfSpeakingFromFFmpeg(output.stdout, opts);

  if (!speakingClips[0]) {
    throw new CouldNotFindStartTimeError();
  }

  const endClip = speakingClips[speakingClips.length - 1];

  if (!endClip) {
    throw new CouldNotFindEndTimeError();
  }

  const startTime = speakingClips[0].startTime;
  const endTime = endClip.endTime;

  return {
    speakingClips,
    startTime,
    endTime,
  };
};

export const formatFloatForFFmpeg = (num: number) => {
  return num.toFixed(3);
};

export const trimVideo = async (
  inputVideo: AbsolutePath,
  outputVideo: AbsolutePath,
  startTime: number,
  endTime: number,
) => {
  await execAsync(
    `ffmpeg -y -hide_banner -ss ${formatFloatForFFmpeg(
      startTime,
    )} -to ${formatFloatForFFmpeg(
      endTime,
    )} -i "${inputVideo}" -c copy "${outputVideo.replaceAll("\\", "")}"`,
  );
};
