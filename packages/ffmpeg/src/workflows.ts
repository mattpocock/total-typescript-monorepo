import { type AbsolutePath } from "@total-typescript/shared";
import { execSync, type ExecException } from "child_process";
import { errAsync, okAsync, ResultAsync, safeTry } from "neverthrow";
import path from "path";
import { createAutoEditedVideo } from "./auto-editing.js";
import { renderSubtitles } from "./subtitle-rendering.js";
import type { Context } from "./types.js";

export interface CreateAutoEditedVideoWorkflowOptions {
  getLatestVideo: () => ResultAsync<AbsolutePath, ExecException>;
  promptForFilename: () => Promise<string>;
  validateFilename: (filename: string) => { isValid: boolean; error?: string };
  exportDirectory: string;
  shortsExportDirectory: string;
  dryRun?: boolean;
  subtitles?: boolean;
  ctx: Context;
}

export class NoSpeakingClipsError extends Error {
  readonly _tag = "NoSpeakingClipsError";
  override message = "No speaking clips found";
}

export const createAutoEditedVideoWorkflow = async (
  options: CreateAutoEditedVideoWorkflowOptions
) => {
  return safeTry(async function* () {
    const latestVideo = yield* options.getLatestVideo();

    const fps = yield* options.ctx.ffmpeg.getFPS(latestVideo);

    const outputFilename = await options.promptForFilename();

    const validationResult = options.validateFilename(outputFilename);
    if (!validationResult.isValid) {
      console.error("Error:", validationResult.error);
      process.exit(1);
    }

    // First create in the export directory
    const tempOutputPath = path.join(
      options.exportDirectory,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    const result = yield* createAutoEditedVideo({
      inputVideo: latestVideo,
      outputVideo: tempOutputPath,
      ctx: options.ctx,
    });

    const speakingClips = result.speakingClips;

    console.log(`Video created successfully at: ${tempOutputPath}`);

    let finalVideoPath = tempOutputPath;

    if (options.subtitles) {
      const withSubtitlesPath = path.join(
        options.exportDirectory,
        `${outputFilename}-with-subtitles.mp4`
      ) as AbsolutePath;

      const firstClipLength = speakingClips[0]!.duration * fps;

      const totalDurationInFrames = speakingClips.reduce(
        (acc, clip) => acc + clip.duration,
        0
      );

      if (!firstClipLength) {
        return errAsync(new NoSpeakingClipsError());
      }

      yield* renderSubtitles({
        inputPath: tempOutputPath,
        outputPath: withSubtitlesPath,
        ctaDurationInFrames: firstClipLength,
        durationInFrames: totalDurationInFrames * fps,
        ctx: options.ctx,
        originalFileName: path.parse(latestVideo).name,
      });
      finalVideoPath = withSubtitlesPath;
    } else {
      const transcriptionPath = path.join(
        options.ctx.transcriptionDirectory,
        `${path.parse(latestVideo).name}.txt`
      ) as AbsolutePath;

      const audioPath = `${tempOutputPath}.mp3` as AbsolutePath;

      await options.ctx.ffmpeg.extractAudioFromVideo(tempOutputPath, audioPath);

      const subtitles =
        await options.ctx.ffmpeg.createSubtitleFromAudio(audioPath);

      await options.ctx.fs.writeFile(
        transcriptionPath,
        subtitles
          .map((s) => s.text)
          .join("")
          .trim()
      );

      await options.ctx.fs.unlink(audioPath);
    }

    if (options.dryRun) {
      console.log("Dry run mode: Skipping move to shorts directory");
      return okAsync(finalVideoPath);
    }

    // Then move to shorts directory
    const finalOutputPath = path.join(
      options.shortsExportDirectory,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    await options.ctx.fs.rename(finalVideoPath, finalOutputPath);
    console.log(`Video moved to: ${finalOutputPath}`);

    return okAsync(finalOutputPath);
  });
};

export interface TranscribeVideoWorkflowOptions {
  exportDirectory: string;
  shortsExportDirectory: string;
  promptForVideoSelection: (
    videos: Array<{ title: string; value: AbsolutePath; mtime: Date }>
  ) => Promise<AbsolutePath | undefined>;
  ctx: Context;
}

export const transcribeVideoWorkflow = async (
  options: TranscribeVideoWorkflowOptions
) => {
  // Get all files from both directories
  const [exportFiles, shortsFiles] = await Promise.all([
    options.ctx.fs.readdir(options.exportDirectory),
    options.ctx.fs.readdir(options.shortsExportDirectory),
  ]);

  // Get stats for all files in parallel
  const exportStats = await Promise.all(
    exportFiles
      .filter((file) => file.endsWith(".mp4"))
      .map(async (file) => {
        const fullPath = path.join(
          options.exportDirectory,
          file
        ) as AbsolutePath;
        const stats = await options.ctx.fs.stat(fullPath);
        return {
          title: `Export: ${file}`,
          value: fullPath,
          mtime: stats.mtime,
        };
      })
  );

  const shortsStats = await Promise.all(
    shortsFiles
      .filter((file) => file.endsWith(".mp4"))
      .map(async (file) => {
        const fullPath = path.join(
          options.shortsExportDirectory,
          file
        ) as AbsolutePath;
        const stats = await options.ctx.fs.stat(fullPath);
        return {
          title: `Shorts: ${file}`,
          value: fullPath,
          mtime: stats.mtime,
        };
      })
  );

  // Combine and sort by modification time (newest first)
  const videoFiles = [...exportStats, ...shortsStats].sort(
    (a, b) => b.mtime.getTime() - a.mtime.getTime()
  );

  if (videoFiles.length === 0) {
    console.error("No video files found in either directory");
    process.exit(1);
  }

  const selectedVideo = await options.promptForVideoSelection(videoFiles);

  if (!selectedVideo) {
    console.error("No video selected");
    process.exit(1);
  }

  console.log("Transcribing video...");

  const audioPath = path.join(
    path.dirname(selectedVideo),
    `${path.basename(selectedVideo)}.mp3`
  ) as AbsolutePath;

  await options.ctx.ffmpeg.extractAudioFromVideo(selectedVideo, audioPath);

  const transcript = await options.ctx.ffmpeg.transcribeAudio(audioPath);

  await options.ctx.fs.unlink(audioPath);
  console.log("\nTranscript:");
  console.log(transcript);
};

export interface MoveRawFootageOptions {
  obsOutputDirectory: string;
  longTermStorageDirectory: string;
}

export const moveRawFootageToLongTermStorage = (
  options: MoveRawFootageOptions
) => {
  execSync(
    `(cd "${options.longTermStorageDirectory}" && mv "${options.obsOutputDirectory}"/* .)`
  );
};
