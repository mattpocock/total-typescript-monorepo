export const getClipsOfSpeakingFromFFmpeg = (stdout: string, fps: number) => {
  let silence = stdout
    .trim()
    .split("\n")
    .map((line) => line.split(" "))
    .map(([silenceEnd, duration]) => {
      return {
        silenceEnd: Number(silenceEnd),
        duration: Number(duration),
      };
    })
    .filter(({ silenceEnd, duration }) => {
      return !(isNaN(silenceEnd) || isNaN(duration));
    })
    .filter(({ duration }) => {
      return duration > 0.2;
    });

  const clipsOfSpeaking: {
    startFrame: string;
    endFrame: string;
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

    const startFrame = Math.floor(startTime * fps);
    const endFrame = Math.ceil(endTime * fps);

    if (startFrame === endFrame) return;

    const endFramePlusOne = endFrame + 1;

    clipsOfSpeaking.push({
      startFrame: startFrame.toFixed(1),
      startTime: startTime,
      endFrame: endFramePlusOne.toFixed(1),
      endTime: endTime,
      silenceEnd: currentSilence.silenceEnd,
      duration: currentSilence.duration,
    });
  });

  return clipsOfSpeaking;
};
