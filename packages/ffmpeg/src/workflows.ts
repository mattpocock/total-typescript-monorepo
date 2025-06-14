import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { type AbsolutePath } from "@total-typescript/shared";
import {
  createAutoEditedVideo,
  extractAudioFromVideo,
  renderSubtitles,
  transcribeAudio,
} from "./index.js";

export interface CreateAutoEditedVideoWorkflowOptions {
  getLatestVideo: () => any;
  promptForFilename: () => Promise<string>;
  validateFilename: (filename: string) => { isValid: boolean; error?: string };
  exportDirectory: string;
  shortsExportDirectory: string;
  dryRun?: boolean;
  subtitles?: boolean;
}

export const createAutoEditedVideoWorkflow = async (
  options: CreateAutoEditedVideoWorkflowOptions
) => {
  const latestVideoResult = await options.getLatestVideo();
  if (latestVideoResult.isErr()) {
    console.error("Failed to get latest video:", latestVideoResult.error);
    process.exit(1);
  }

  const latestVideo = latestVideoResult.value!;

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

  const result = await createAutoEditedVideo({
    inputVideo: latestVideo,
    outputVideo: tempOutputPath,
  });

  if (result.isErr()) {
    console.error("Failed to create auto-edited video:", result.error);
    process.exit(1);
  }

  const speakingClips = result.value.speakingClips;

  console.log(`Video created successfully at: ${tempOutputPath}`);

  let finalVideoPath = tempOutputPath;

  if (options.subtitles) {
    const withSubtitlesPath = path.join(
      options.exportDirectory,
      `${outputFilename}-with-subtitles.mp4`
    ) as AbsolutePath;

    const firstClipLength = speakingClips[0]!.durationInFrames;

    const totalDurationInFrames = speakingClips.reduce(
      (acc, clip) => acc + clip.durationInFrames,
      0
    );

    if (!firstClipLength) {
      console.error("No speaking clips found");
      process.exit(1);
    }

    await renderSubtitles({
      inputPath: tempOutputPath,
      outputPath: withSubtitlesPath,
      ctaDurationInFrames: firstClipLength,
      durationInFrames: totalDurationInFrames,
    });
    finalVideoPath = withSubtitlesPath;
  }

  if (options.dryRun) {
    console.log("Dry run mode: Skipping move to shorts directory");
    return;
  }

  // Then move to shorts directory
  const finalOutputPath = path.join(
    options.shortsExportDirectory,
    `${outputFilename}.mp4`
  ) as AbsolutePath;

  await fs.rename(finalVideoPath, finalOutputPath);
  console.log(`Video moved to: ${finalOutputPath}`);
};

export interface TranscribeVideoWorkflowOptions {
  exportDirectory: string;
  shortsExportDirectory: string;
  promptForVideoSelection: (videos: Array<{ title: string; value: AbsolutePath; mtime: Date }>) => Promise<AbsolutePath | undefined>;
}

export const transcribeVideoWorkflow = async (
  options: TranscribeVideoWorkflowOptions
) => {
  // Get all files from both directories
  const [exportFiles, shortsFiles] = await Promise.all([
    fs.readdir(options.exportDirectory),
    fs.readdir(options.shortsExportDirectory),
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
        const stats = await fs.stat(fullPath);
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
        const stats = await fs.stat(fullPath);
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

  await extractAudioFromVideo(selectedVideo, audioPath);

  const transcript = await transcribeAudio(audioPath);

  await fs.unlink(audioPath);
  console.log("\nTranscript:");
  console.log(transcript);
};

export interface MoveRawFootageOptions {
  obsOutputDirectory: string;
  longTermStorageDirectory: string;
}

export const moveRawFootageToLongTermStorage = (options: MoveRawFootageOptions) => {
  execSync(
    `(cd "${options.longTermStorageDirectory}" && mv "${options.obsOutputDirectory}"/* .)`
  );
};