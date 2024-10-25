import {
  PADDING,
  SILENCE_DURATION,
  THRESHOLD,
  findSilenceInVideo,
  getFPS,
  trimVideo,
} from "@total-typescript/ffmpeg";
import {
  REPOS_FOLDER,
  ensureDir,
  exitProcessWithError,
  getActiveEditorFilePath,
  parseExercisePath,
  type AbsolutePath,
  type RelativePath,
} from "@total-typescript/shared";
import { err, ok, safeTry } from "neverthrow";
import path from "path";
import { EXTERNAL_DRIVE_MOVIES_ROOT, getExternalDrive } from "./constants.js";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";

export const trimLatestOBSVideo = () => {
  return safeTry(async function* () {
    yield* getExternalDrive();

    const latestOBSVideo = yield* getLatestOBSVideo();

    const activeEditorFilePath = yield* getActiveEditorFilePath();

    const relativePathToReposFolder = path.relative(
      REPOS_FOLDER,
      activeEditorFilePath
    ) as RelativePath;

    const absolutePathToTrimmedFootage = path.resolve(
      EXTERNAL_DRIVE_MOVIES_ROOT,
      relativePathToReposFolder
    ) as AbsolutePath;

    if (relativePathToReposFolder.startsWith("..")) {
      return err(
        new Error("Active editor file path is not in the repos folder")
      );
    }

    const result = yield* parseExercisePath(absolutePathToTrimmedFootage);

    const fps = yield* getFPS(activeEditorFilePath);

    const silence = yield* findSilenceInVideo(activeEditorFilePath, {
      silenceDuration: SILENCE_DURATION,
      padding: PADDING,
      threshold: THRESHOLD,
      fps,
    });

    const outputFolder = path.dirname(result.resolvedPath) as AbsolutePath;

    await ensureDir(outputFolder);

    console.log("Trimming video...");

    const unNormalizedFilename = (result.resolvedPath.replace(
      /\.(ts|tsx)/g,
      ""
    ) + ".un-encoded.mp4") as AbsolutePath;

    yield* trimVideo(
      latestOBSVideo,
      unNormalizedFilename,
      silence.startTime,
      silence.endTime
    );

    return ok(void 0);
  }).then((r) => {
    return r.mapErr((e) => {
      exitProcessWithError(e.message);
    });
  });
};
