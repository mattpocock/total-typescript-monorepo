import { type AbsolutePath } from "@total-typescript/shared";
import { err, ok, safeTry } from "neverthrow";
import path from "path";
import type { Context } from "./types.js";

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

const splitSubtitle = (subtitle: Subtitle): Subtitle[] => {
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
  ctx,
}: {
  inputPath: AbsolutePath;
  outputPath: AbsolutePath;
  ctaDurationInFrames: number;
  durationInFrames: number;
  ctx: Context;
}) => {
  return safeTry(async function* () {
    const startTime = Date.now();
    console.log("🎥 Processing video for subtitles:", inputPath);
    console.log("📝 Output will be saved to:", outputPath);

    const audioPath = `${inputPath}.mp3` as AbsolutePath;

    try {
      console.log("🎵 Extracting audio...");
      const audioStart = Date.now();
      await ctx.ffmpeg.extractAudioFromVideo(inputPath, audioPath);
      console.log(
        `✅ Audio extracted successfully (took ${(Date.now() - audioStart) / 1000}s)`
      );

      console.log("🎙️ Transcribing audio...");
      const transcribeStart = Date.now();
      const subtitles = await ctx.ffmpeg.createSubtitleFromAudio(audioPath);

      console.log(
        `✅ Audio transcribed successfully (took ${(Date.now() - transcribeStart) / 1000}s)`
      );

      const processedSubtitles = subtitles.flatMap(splitSubtitle);

      console.log("⏱️ Detecting video FPS...");
      const fpsStart = Date.now();
      const fpsResult = await ctx.ffmpeg.getFPS(inputPath);
      if (fpsResult.isErr()) {
        throw fpsResult.error;
      }
      const fps = fpsResult.value;
      console.log(
        `✅ Detected FPS: ${fps} (took ${(Date.now() - fpsStart) / 1000}s)`
      );

      const subtitlesAsFrames = processedSubtitles.map(
        (subtitle: Subtitle) => ({
          startFrame: Math.floor(subtitle.start * fps),
          endFrame: Math.floor(subtitle.end * fps),
          text: subtitle.text.trim(),
        })
      );

      const fullTranscriptText = processedSubtitles
        .map((subtitle) => subtitle.text)
        .join(" ");

      console.log("🔍 Figuring out which CTA to show...");

      const cta = await ctx.ffmpeg.figureOutWhichCTAToShow(fullTranscriptText);

      console.log(`✅ Decided on CTA: ${cta}`);

      const meta = {
        subtitles: subtitlesAsFrames,
        cta,
        ctaDurationInFrames,
        durationInFrames,
      };

      const META_FILE_PATH = path.join(REMOTION_DIR, "src", "meta.json");
      await ctx.fs.writeFile(META_FILE_PATH, JSON.stringify(meta));

      const subtitlesOverlayPath = path.join(
        REMOTION_DIR,
        "out",
        "MyComp.mov"
      ) as AbsolutePath;

      console.log("🎬 Rendering subtitles...");
      const renderStart = Date.now();
      const renderResult = await ctx.ffmpeg.renderRemotion(
        subtitlesOverlayPath,
        REMOTION_DIR
      );

      if (renderResult.isErr()) {
        throw renderResult.error;
      }
      console.log(
        `✅ Subtitles rendered (took ${(Date.now() - renderStart) / 1000}s)`
      );

      const layeringResult = await ctx.ffmpeg.overlaySubtitles(
        inputPath,
        subtitlesOverlayPath,
        outputPath
      );

      if (layeringResult.isErr()) {
        throw layeringResult.error;
      }

      await ctx.fs.unlink(audioPath);

      const totalTime = (Date.now() - startTime) / 1000;
      console.log(
        `✅ Successfully rendered subtitles! (Total time: ${totalTime}s)`
      );

      return ok(undefined);
    } catch (error) {
      try {
        await ctx.fs.unlink(audioPath);
      } catch {
        // Ignore error if file doesn't exist
      }
      return err(error);
    }
  });
};
