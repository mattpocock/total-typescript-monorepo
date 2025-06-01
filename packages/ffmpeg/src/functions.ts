import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { err, ok, safeTry } from "neverthrow";
import { MINIMUM_CLIP_LENGTH_IN_SECONDS } from "./constants.js";
import { getClipsOfSpeakingFromFFmpeg } from "./getSpeakingClips.js";
import path from "path";
import fs from "fs/promises";
import {
  createSubtitleFromAudio,
  extractAudioFromVideo,
  getFPS,
} from "./index.js";

export const encodeVideo = (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`
  );
};

export class CouldNotFindStartTimeError extends Error {
  readonly _tag = "CouldNotFindStartTimeError";
  override message = "Could not find video start time.";
}

export class CouldNotFindEndTimeError extends Error {
  readonly _tag = "CouldNotFindEndTimeError";
  override message = "Could not find video end time.";
}

export const findSilenceInVideo = (
  inputVideo: AbsolutePath,
  opts: {
    threshold: number | string;
    silenceDuration: number | string;
    startPadding: number;
    endPadding: number;
    fps: number;
  }
) => {
  return safeTry(async function* () {
    const processStartTime = Date.now();
    console.log("🎥 Processing video:", inputVideo);

    // First, find all speaking clips
    console.log("🔍 Finding speaking clips...");
    const speakingStart = Date.now();
    const { stdout } = yield* execAsync(
      `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${opts.threshold}dB:d=${opts.silenceDuration}" -f null - 2>&1`
    );

    const speakingClips = getClipsOfSpeakingFromFFmpeg(stdout, opts);
    console.log(
      `✅ Found ${speakingClips.length} speaking clips (took ${(Date.now() - speakingStart) / 1000}s)`
    );

    if (!speakingClips[0]) {
      return err(new CouldNotFindStartTimeError());
    }

    const endClip = speakingClips[speakingClips.length - 1];

    if (!endClip) {
      return err(new CouldNotFindEndTimeError());
    }

    const clipStartTime = speakingClips[0].startTime;
    const endTime = endClip.endTime;

    // Filter out clips that are too short
    console.log("🔍 Filtering clips...");
    const filterStart = Date.now();

    const filteredClips = speakingClips.filter(
      (clip) => clip.duration > MINIMUM_CLIP_LENGTH_IN_SECONDS
    );

    console.log(
      `✅ Filtered to ${filteredClips.length} clips (took ${(Date.now() - filterStart) / 1000}s)`
    );

    const totalTime = (Date.now() - processStartTime) / 1000;
    console.log(`✅ Successfully processed video! (Total time: ${totalTime}s)`);

    return ok({
      speakingClips: filteredClips,
      startTime: clipStartTime,
      endTime,
      rawStdout: stdout,
    });
  });
};

export const formatFloatForFFmpeg = (num: number) => {
  return num.toFixed(3);
};

export const trimVideo = (
  inputVideo: AbsolutePath,
  outputVideo: AbsolutePath,
  startTime: number,
  endTime: number
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -ss ${formatFloatForFFmpeg(
      startTime
    )} -to ${formatFloatForFFmpeg(
      endTime
    )} -i "${inputVideo}" -c copy "${outputVideo.replaceAll("\\", "")}"`
  );
};

export type VideoPosition = {
  x: number;
  y: number;
};

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
  // If the subtitle is already short enough, return it as is
  if (subtitle.text.length <= MAXIMUM_SUBTITLE_LENGTH_IN_CHARS) {
    return [subtitle];
  }

  // Calculate how many chunks we need
  const numChunks = Math.ceil(
    subtitle.text.length / MAXIMUM_SUBTITLE_LENGTH_IN_CHARS
  );

  // Split the text into words
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

export const renderSubtitles = (
  inputPath: AbsolutePath,
  outputPath: AbsolutePath
) => {
  return safeTry(async function* () {
    const startTime = Date.now();
    console.log("🎥 Processing video for subtitles:", inputPath);
    console.log("📝 Output will be saved to:", outputPath);

    const audioPath = `${inputPath}.mp3` as AbsolutePath;

    try {
      // Extract audio
      console.log("🎵 Extracting audio...");
      const audioStart = Date.now();
      await extractAudioFromVideo(inputPath, audioPath);
      console.log(
        `✅ Audio extracted successfully (took ${(Date.now() - audioStart) / 1000}s)`
      );

      // Transcribe audio
      console.log("🎙️ Transcribing audio...");
      const transcribeStart = Date.now();
      const subtitles = await createSubtitleFromAudio(audioPath);
      console.log(
        `✅ Audio transcribed successfully (took ${(Date.now() - transcribeStart) / 1000}s)`
      );

      // Split long subtitles into smaller chunks
      const processedSubtitles = subtitles.flatMap(splitSubtitle);

      console.log("⏱️ Detecting video FPS...");
      const fpsStart = Date.now();
      const fpsResult = await getFPS(inputPath);
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

      const JSON_FILE_PATH = path.join(REMOTION_DIR, "src", "subtitle.json");

      await fs.writeFile(JSON_FILE_PATH, JSON.stringify(subtitlesAsFrames));

      await fs.copyFile(
        inputPath,
        path.join(REMOTION_DIR, "public", "input.mp4") as AbsolutePath
      );

      const subtitlesOverlayPath = path.join(REMOTION_DIR, "out", "MyComp.mov");

      console.log("🎬 Rendering subtitles...");
      const renderStart = Date.now();
      const renderResult = await execAsync(
        `nice -n 19 npx remotion render MyComp "${subtitlesOverlayPath}"`,
        {
          cwd: REMOTION_DIR,
        }
      );

      if (renderResult.isErr()) {
        throw renderResult.error;
      }
      console.log(
        `✅ Subtitles rendered (took ${(Date.now() - renderStart) / 1000}s)`
      );

      const layeringResult = await execAsync(
        `nice -n 19 ffmpeg -i "${inputPath}" -i "${subtitlesOverlayPath}" -filter_complex "[0:v][1:v]overlay" -c:a copy "${outputPath}"`
      );

      if (layeringResult.isErr()) {
        throw layeringResult.error;
      }

      // Clean up the temporary audio file
      await fs.unlink(audioPath);

      const totalTime = (Date.now() - startTime) / 1000;
      console.log(
        `✅ Successfully rendered subtitles! (Total time: ${totalTime}s)`
      );

      return ok(undefined);
    } catch (error) {
      // Clean up the temporary audio file if it exists
      try {
        await fs.unlink(audioPath);
      } catch {
        // Ignore error if file doesn't exist
      }
      return err(error);
    }
  });
};
