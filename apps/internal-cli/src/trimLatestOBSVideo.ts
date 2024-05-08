import path from "path";
import { getActiveEditorFilePath } from "./getActiveEditorFilePath.js";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import {
  EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
  ExerciseNotFoundError,
  ExternalDriveNotFoundError,
  REPOS_FOLDER,
  exitProcessWithError,
  getExternalDrive,
  parseExercisePath,
  type AbsolutePath,
  type RelativePath,
} from "@total-typescript/shared";
import {
  CouldNotFindEndTimeError,
  CouldNotFindStartTimeError,
  PADDING,
  SILENCE_DURATION,
  THRESHOLD,
  findStartAndEndSilenceInVideo,
  trimVideo,
} from "@total-typescript/ffmpeg";
import { ensureDir } from "fs-extra/esm";

export const trimLatestOBSVideo = async () => {
  const externalDrive = await getExternalDrive();

  if (externalDrive instanceof ExternalDriveNotFoundError) {
    exitProcessWithError(`External drive not found: ${externalDrive.path}`);
  }

  const latestOBSVideo = await getLatestOBSVideo();

  const activeEditorFilePath = await getActiveEditorFilePath();

  if (!activeEditorFilePath) {
    exitProcessWithError("Active editor file path not found");
  }

  const relativePathToReposFolder = path.relative(
    REPOS_FOLDER,
    activeEditorFilePath,
  ) as RelativePath;

  const absolutePathToTrimmedFootage = path.resolve(
    EXTERNAL_DRIVE_RAW_FOOTAGE_ROOT,
    relativePathToReposFolder,
  ) as AbsolutePath;

  if (relativePathToReposFolder.startsWith("..")) {
    exitProcessWithError("Active editor file path is not in the repos folder");
  }

  const result = parseExercisePath(absolutePathToTrimmedFootage);

  if (result instanceof ExerciseNotFoundError) {
    exitProcessWithError("Exercise not found");
  }

  const outputFolder = path.dirname(result.resolvedPath) as AbsolutePath;
  const outputFilename = (result.resolvedPath.replace(/\.(ts|tsx)/g, "") +
    ".un-encoded.mp4") as AbsolutePath;

  console.log("Finding silence...");

  const silenceResult = await findStartAndEndSilenceInVideo(latestOBSVideo, {
    silenceDuration: SILENCE_DURATION,
    padding: PADDING,
    threshold: THRESHOLD,
  });

  if (silenceResult instanceof CouldNotFindStartTimeError) {
    exitProcessWithError("Could not find start time");
  }

  if (silenceResult instanceof CouldNotFindEndTimeError) {
    exitProcessWithError("Could not find end time");
  }

  await ensureDir(outputFolder);

  console.log("Trimming video...");

  await trimVideo(
    latestOBSVideo,
    outputFilename,
    silenceResult.startTime,
    silenceResult.endTime,
  );
};
