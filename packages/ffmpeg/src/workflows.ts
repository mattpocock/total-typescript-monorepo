import { FileSystem } from "@effect/platform/FileSystem";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { Config, Console, Data, Effect } from "effect";
import path from "path";
import { createAutoEditedVideo } from "./auto-editing.js";
import {
  AskQuestionService,
  FFmpegCommandsService,
  OBSIntegrationService,
  TranscriptStorageService,
} from "./services.js";
import { renderSubtitles } from "./subtitle-rendering.js";
import { validateWindowsFilename } from "./validate-windows-filename.js";

export interface CreateAutoEditedVideoWorkflowOptions {
  dryRun?: boolean;
  subtitles?: boolean;
}

export class NoSpeakingClipsError extends Data.TaggedError(
  "NoSpeakingClipsError"
) {}

export class FileAlreadyExistsError extends Data.TaggedError(
  "FileAlreadyExistsError"
)<{
  message: string;
}> {}

export const createAutoEditedVideoWorkflow = (
  options: CreateAutoEditedVideoWorkflowOptions
) => {
  return Effect.gen(function* () {
    const obs = yield* OBSIntegrationService;
    const askQuestion = yield* AskQuestionService;

    const latestObsRawVideo = yield* obs.getLatestOBSVideo();

    const outputFilename = yield* askQuestion.askQuestion(
      "Enter a filename for the video"
    );

    yield* validateWindowsFilename(outputFilename);

    const fs = yield* FileSystem;

    const exportDirectory = yield* Config.string("EXPORT_DIRECTORY");
    const shortsExportDirectory = yield* Config.string(
      "SHORTS_EXPORT_DIRECTORY"
    );

    const [alreadyExistsInExportDirectory, alreadyExistsInShortsDirectory] =
      yield* Effect.all([
        fs.exists(path.join(exportDirectory, `${outputFilename}.mp4`)),
        fs.exists(path.join(shortsExportDirectory, `${outputFilename}.mp4`)),
      ]);

    if (alreadyExistsInExportDirectory) {
      return yield* new FileAlreadyExistsError({
        message: "File already exists in export directory",
      });
    }

    if (alreadyExistsInShortsDirectory) {
      return yield* new FileAlreadyExistsError({
        message: "File already exists in shorts directory",
      });
    }

    const ffmpeg = yield* FFmpegCommandsService;

    const fps = yield* ffmpeg.getFPS(latestObsRawVideo);

    // First create in the export directory
    const videoInExportDirectoryPath = path.join(
      exportDirectory,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    const result = yield* createAutoEditedVideo({
      inputVideo: latestObsRawVideo,
      outputVideo: videoInExportDirectoryPath,
    });

    const speakingClips = result.speakingClips;

    yield* Console.log(
      `Video created successfully at: ${videoInExportDirectoryPath}`
    );

    let finalVideoPath = videoInExportDirectoryPath;

    if (options.subtitles) {
      const withSubtitlesPath = path.join(
        exportDirectory,
        `${outputFilename}-with-subtitles.mp4`
      ) as AbsolutePath;

      const firstClipLength = speakingClips[0]!.duration * fps;

      const totalDurationInFrames = speakingClips.reduce(
        (acc, clip) => acc + clip.duration,
        0
      );

      if (!firstClipLength) {
        return yield* new NoSpeakingClipsError();
      }

      yield* renderSubtitles({
        inputPath: videoInExportDirectoryPath,
        outputPath: withSubtitlesPath,
        ctaDurationInFrames: firstClipLength,
        durationInFrames: totalDurationInFrames * fps,
        originalFileName: path.parse(latestObsRawVideo).name,
      });
      finalVideoPath = withSubtitlesPath;
    } else {
      const transcriptStorage = yield* TranscriptStorageService;

      const audioPath = `${videoInExportDirectoryPath}.mp3` as AbsolutePath;

      yield* ffmpeg.extractAudioFromVideo(
        videoInExportDirectoryPath,
        audioPath
      );

      const subtitles = yield* ffmpeg.createSubtitleFromAudio(audioPath);

      yield* transcriptStorage.storeTranscript({
        transcript: subtitles.segments
          .map((s) => s.text)
          .join("")
          .trim(),
        filename: path.parse(latestObsRawVideo).name,
      });

      yield* fs.remove(audioPath);
    }

    if (options.dryRun) {
      yield* Console.log("Dry run mode: Skipping move to shorts directory");
      return finalVideoPath;
    }

    // Then move to shorts directory
    const finalOutputPath = path.join(
      yield* Config.string("SHORTS_EXPORT_DIRECTORY"),
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    yield* fs.rename(finalVideoPath, finalOutputPath);
    yield* Console.log(`Video moved to: ${finalOutputPath}`);

    return finalOutputPath;
  });
};

export const transcribeVideoWorkflow = () => {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const ffmpeg = yield* FFmpegCommandsService;

    const exportDirectory = yield* Config.string("EXPORT_DIRECTORY");
    const shortsExportDirectory = yield* Config.string(
      "SHORTS_EXPORT_DIRECTORY"
    );

    // Get all files from both directories
    const [exportFiles, shortsFiles] = yield* Effect.all([
      fs.readDirectory(exportDirectory),
      fs.readDirectory(shortsExportDirectory),
    ]);

    // Get stats for all files in parallel
    const exportStats = yield* Effect.all(
      exportFiles
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => {
          return Effect.gen(function* () {
            const fullPath = path.join(exportDirectory, file) as AbsolutePath;
            const stats = yield* fs.stat(fullPath);
            const mtime = yield* stats.mtime;
            return {
              title: `Export: ${file}`,
              value: fullPath,
              mtime,
            };
          });
        })
    );

    const shortsStats = yield* Effect.all(
      shortsFiles
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => {
          return Effect.gen(function* () {
            const fullPath = path.join(
              shortsExportDirectory,
              file
            ) as AbsolutePath;
            const stats = yield* fs.stat(fullPath);
            const mtime = yield* stats.mtime;
            return {
              title: `Shorts: ${file}`,
              value: fullPath,
              mtime,
            };
          });
        })
    );

    // Combine and sort by modification time (newest first)
    const videoFiles = [...exportStats, ...shortsStats].sort(
      (a, b) => b.mtime.getTime() - a.mtime.getTime()
    );

    if (videoFiles.length === 0) {
      yield* Console.error("No video files found in either directory");
      process.exit(1);
    }

    const askQuestion = yield* AskQuestionService;

    const selectedVideo = yield* askQuestion.select(
      "Select a video to transcribe",
      videoFiles.map((file) => ({
        title: file.title,
        value: file.value,
      }))
    );

    if (!selectedVideo) {
      yield* Console.error("No video selected");
      process.exit(1);
    }

    yield* Console.log("Transcribing video...");

    const audioPath = path.join(
      path.dirname(selectedVideo),
      `${path.basename(selectedVideo)}.${yield* Config.string("AUDIO_FILE_EXTENSION")}`
    ) as AbsolutePath;

    yield* ffmpeg.extractAudioFromVideo(selectedVideo, audioPath);

    const transcript = yield* ffmpeg.transcribeAudio(audioPath);

    yield* fs.remove(audioPath);
    yield* Console.log("\nTranscript:");
    yield* Console.log(transcript);
  });
};

export const moveRawFootageToLongTermStorage = () => {
  return Effect.gen(function* () {
    const longTermStorageDirectory = yield* Config.string(
      "LONG_TERM_FOOTAGE_STORAGE_DIRECTORY"
    );

    const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");

    yield* execAsync(
      `(cd "${longTermStorageDirectory}" && mv "${obsOutputDirectory}"/* .)`
    );
  });
};
