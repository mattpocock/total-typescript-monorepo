import path from "path";

export type Subtitle = {
  start: number;
  end: number;
  text: string;
};

export const REMOTION_DIR = path.join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "apps",
  "remotion-subtitle-renderer"
);

const MAXIMUM_SUBTITLE_LENGTH_IN_CHARS = 32;

export const splitSubtitleSegments = (subtitle: Subtitle): Subtitle[] => {
  if (subtitle.text.length <= MAXIMUM_SUBTITLE_LENGTH_IN_CHARS) {
    return [subtitle];
  }

  const numChunks = Math.ceil(
    subtitle.text.length / MAXIMUM_SUBTITLE_LENGTH_IN_CHARS
  );

  const words = subtitle.text.split(" ");

  const wordsPerChunk = Math.ceil(words.length / numChunks);

  const chunks: Subtitle[] = [];

  const duration = subtitle.end - subtitle.start;
  const chunkDuration = duration / numChunks;

  for (let i = 0; i < numChunks; i++) {
    const startTime = subtitle.start + i * chunkDuration;
    const endTime = startTime + chunkDuration;

    const startWordIndex = i * wordsPerChunk;
    const endWordIndex = startWordIndex + wordsPerChunk;

    chunks.push({
      start: startTime,
      end: endTime,
      text: words.slice(startWordIndex, endWordIndex).join(" ").trim(),
    });
  }

  return chunks;
};
