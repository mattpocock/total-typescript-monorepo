import {
  createAutoEditedVideo,
  renderSubtitles,
} from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import { Effect } from "effect";
import path from "path";
import { AskQuestionService } from "./ask-question-service.js";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import { validateWindowsFilename } from "./validateWindowsFilename.js";
import { EnvService } from "@total-typescript/env";
import { FileSystem } from "@effect/platform";

export const createAutoEditedVideoCommand = (options: {
  subtitles: boolean;
  dryRun: boolean;
}) =>
  Effect.gen(function* () {
    const env = yield* EnvService;
    const latestVideo = yield* getLatestOBSVideo();

    const questionService = yield* AskQuestionService;

    const outputFilename = yield* questionService.askQuestion(
      `Enter the name for your video (without extension): `
    );

    yield* validateWindowsFilename(outputFilename);

    // First create in the export directory
    const tempOutputPath = path.join(
      env.dirs.exportDirectoryInUnix,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    yield* createAutoEditedVideo({
      inputVideo: latestVideo,
      outputVideo: tempOutputPath,
    });

    console.log(`Video created successfully at: ${tempOutputPath}`);

    let finalVideoPath = tempOutputPath;

    if (options.subtitles) {
      const withSubtitlesPath = path.join(
        env.dirs.exportDirectoryInUnix,
        `${outputFilename}-with-subtitles.mp4`
      ) as AbsolutePath;

      yield* renderSubtitles(tempOutputPath, withSubtitlesPath);
      finalVideoPath = withSubtitlesPath;
    }

    if (options.dryRun) {
      console.log("Dry run mode: Skipping move to shorts directory");
      return;
    }

    // Then move to shorts directory
    const finalOutputPath = path.join(
      env.dirs.shortsExportDirectory,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    const fs = yield* FileSystem.FileSystem;

    yield* fs.rename(finalVideoPath, finalOutputPath);
    console.log(`Video moved to: ${finalOutputPath}`);
  });
