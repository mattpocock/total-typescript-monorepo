import { FileSystem } from "@effect/platform/FileSystem";
import { type AbsolutePath } from "@total-typescript/shared";
import { Config, Effect } from "effect";
import path from "path";
import { FFmpegCommandsService } from "./services.js";

export type Subtitle = {
  start: number;
  end: number;
  text: string;
};

const REMOTION_DIR = path.join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "apps",
  "remotion-subtitle-renderer"
);

const MAXIMUM_SUBTITLE_LENGTH_IN_CHARS = 32;

const splitSubtitleSegments = (subtitle: Subtitle): Subtitle[] => {
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

export const renderSubtitles = ({
  inputPath,
  outputPath,
  ctaDurationInFrames,
  durationInFrames,
  originalFileName,
}: {
  inputPath: AbsolutePath;
  outputPath: AbsolutePath;
  ctaDurationInFrames: number;
  durationInFrames: number;
  originalFileName: string;
}) => {
  return Effect.gen(function* () {
    const startTime = Date.now();
    console.log("🎥 Processing video for subtitles:", inputPath);
    console.log("📝 Output will be saved to:", outputPath);

    const audioPath = `${inputPath}.mp3` as AbsolutePath;
    const ffmpeg = yield* FFmpegCommandsService;

    const fs = yield* FileSystem;

    console.log("🎵 Extracting audio...");
    const audioStart = Date.now();
    yield* ffmpeg.extractAudioFromVideo(inputPath, audioPath);
    console.log(
      `✅ Audio extracted successfully (took ${(Date.now() - audioStart) / 1000}s)`
    );

    console.log("🎙️ Transcribing audio...");
    const transcribeStart = Date.now();
    const subtitles = yield* ffmpeg.createSubtitleFromAudio(audioPath);

    console.log(
      `✅ Audio transcribed successfully (took ${(Date.now() - transcribeStart) / 1000}s)`
    );

    const transcriptionPath = path.join(
      yield* Config.string("TRANSCRIPTION_DIRECTORY"),
      `${originalFileName}.txt`
    ) as AbsolutePath;

    const fullTranscriptText = subtitles.segments
      .map((s) => s.text)
      .join("")
      .trim();

    yield* fs.writeFileString(transcriptionPath, fullTranscriptText);

    const processedSubtitles = subtitles.segments.flatMap(
      splitSubtitleSegments
    );

    console.log("⏱️ Detecting video FPS...");
    const fpsStart = Date.now();
    const fps = yield* ffmpeg.getFPS(inputPath);
    console.log(
      `✅ Detected FPS: ${fps} (took ${(Date.now() - fpsStart) / 1000}s)`
    );

    const subtitlesAsFrames = processedSubtitles.map((subtitle: Subtitle) => ({
      startFrame: Math.floor(subtitle.start * fps),
      endFrame: Math.floor(subtitle.end * fps),
      text: subtitle.text.trim(),
    }));

    console.log("🔍 Figuring out which CTA to show...");

    const cta = yield* ffmpeg.figureOutWhichCTAToShow(fullTranscriptText);

    console.log(`✅ Decided on CTA: ${cta}`);

    const meta = {
      subtitles: subtitlesAsFrames,
      cta,
      ctaDurationInFrames,
      durationInFrames,
    };

    const META_FILE_PATH = path.join(REMOTION_DIR, "src", "meta.json");
    yield* fs.writeFileString(META_FILE_PATH, JSON.stringify(meta));

    const subtitlesOverlayPath = path.join(
      REMOTION_DIR,
      "out",
      "MyComp.mov"
    ) as AbsolutePath;

    console.log("🎬 Rendering subtitles...");
    const renderStart = Date.now();
    yield* ffmpeg.renderRemotion(subtitlesOverlayPath, REMOTION_DIR);

    console.log(
      `✅ Subtitles rendered (took ${(Date.now() - renderStart) / 1000}s)`
    );

    yield* ffmpeg.overlaySubtitles(inputPath, subtitlesOverlayPath, outputPath);

    yield* fs.remove(audioPath);

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(
      `✅ Successfully rendered subtitles! (Total time: ${totalTime}s)`
    );
  });
};
