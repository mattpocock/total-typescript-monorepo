export const getClipsOfSpeakingFromFFmpeg = (
  stdout: string,
  opts: {
    padding: number;
    fps: number;
  },
) => {
  let silence = stdout
    .trim()
    .split("\n")
    .filter((line) => !line.endsWith("]"))
    .map((line) => line.split(" "))
    .map(([silenceEnd, duration]) => {
      return {
        silenceEnd: Number(silenceEnd),
        duration: Number(duration),
      };
    })
    .filter(({ silenceEnd, duration }) => {
      return !(isNaN(silenceEnd) || isNaN(duration));
    });

  const clipsOfSpeaking: {
    startFrame: number;
    endFrame: number;
    startTime: number;
    endTime: number;
    silenceEnd: number;
    duration: number;
  }[] = [];

  silence.forEach((currentSilence) => {
    const nextSilence = silence[silence.indexOf(currentSilence) + 1];

    if (!nextSilence) return;

    const startTime = currentSilence.silenceEnd;

    const endTime = nextSilence.silenceEnd - nextSilence.duration;

    const startFrame = Math.floor(startTime * opts.fps);
    const endFrame = Math.ceil(endTime * opts.fps);

    if (startFrame === endFrame) return;

    const endFramePlusOne = endFrame + 1;

    const framePadding = opts.padding * opts.fps;

    clipsOfSpeaking.push({
      startFrame: startFrame - framePadding,
      startTime: startTime - opts.padding,
      endFrame: endFramePlusOne + framePadding,
      endTime: endTime + opts.padding,
      silenceEnd: currentSilence.silenceEnd,
      duration: endTime - startTime,
    });
  });

  return clipsOfSpeaking;
};
