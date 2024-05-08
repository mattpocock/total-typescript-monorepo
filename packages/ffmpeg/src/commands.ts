import { type AbsolutePath } from "@total-typescript/shared";
import { execSync } from "child_process";

export const encodeVideo = async (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath,
) => {
  await execSync(
    `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`,
  );
};

export class CouldNotFindStartTimeError {
  readonly _tag = "CouldNotFindStartTimeError";
}

export class CouldNotFindEndTimeError {
  readonly _tag = "CouldNotFindEndTimeError";
}

export const findStartAndEndSilenceInVideo = async (
  inputVideo: AbsolutePath,
  opts: {
    threshold: number | string;
    silenceDuration: number | string;
    padding: number;
  },
) => {
  const output = execSync(
    `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${opts.threshold}dB:d=${opts.silenceDuration}" -f null - 2>&1 | grep "silence_end" | awk '{print $5 " " $8}'`,
  ).toString();

  let silence = output
    .trim()
    .split("\n")
    .map((line) => line.split(" "))
    .map(([silenceEnd, duration]) => {
      return {
        silenceEnd: parseFloat(silenceEnd!),
        duration: parseFloat(duration!),
      };
    });

  let foundFirstPeriodOfTalking = false;

  while (!foundFirstPeriodOfTalking) {
    // Unshift the first silence if the noise afterwards
    // is less than 1 second long
    const silenceElem = silence[0];
    const nextSilenceElem = silence[1];

    const nextSilenceStartTime =
      nextSilenceElem!.silenceEnd - nextSilenceElem!.duration;

    const lengthOfNoise = nextSilenceStartTime - silenceElem!.silenceEnd;

    if (lengthOfNoise < 2) {
      silence.shift();
    } else {
      foundFirstPeriodOfTalking = true;
    }
  }

  const firstSilence = silence[0];

  if (!firstSilence) {
    return new CouldNotFindStartTimeError();
  }

  const lastSilence = silence[silence.length - 1];

  if (!lastSilence) {
    return new CouldNotFindEndTimeError();
  }

  const startTime = firstSilence.silenceEnd - opts.padding;

  const endTime = lastSilence.silenceEnd - lastSilence.duration + opts.padding;

  return {
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
  execSync(
    `ffmpeg -y -hide_banner -ss ${formatFloatForFFmpeg(
      startTime,
    )} -to ${formatFloatForFFmpeg(
      endTime,
    )} -i "${inputVideo}" -c copy "${outputVideo.replaceAll("\\", "")}"`,
  );
};
