import {
  CouldNotFindEndTimeError,
  CouldNotFindStartTimeError,
  PADDING,
  SILENCE_DURATION,
  THRESHOLD,
  findSilenceInVideo,
  getFPS,
  normalizeAudio,
  trimVideo,
} from "@total-typescript/ffmpeg";
import {
  ExerciseNotFoundError,
  ExternalDriveNotFoundError,
  REPOS_FOLDER,
  ensureDir,
  execAsync,
  exitProcessWithError,
  getActiveEditorFilePath,
  parseExercisePath,
  type AbsolutePath,
  type RelativePath,
} from "@total-typescript/shared";
import path from "path";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import { EXTERNAL_DRIVE_MOVIES_ROOT, getExternalDrive } from "./constants.js";
import { execSync } from "child_process";

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
    EXTERNAL_DRIVE_MOVIES_ROOT,
    relativePathToReposFolder,
  ) as AbsolutePath;

  if (relativePathToReposFolder.startsWith("..")) {
    exitProcessWithError("Active editor file path is not in the repos folder");
  }

  console.log("Getting FPS...");

  const fps = await getFPS(latestOBSVideo);

  const result = parseExercisePath(absolutePathToTrimmedFootage);

  if (result instanceof ExerciseNotFoundError) {
    exitProcessWithError("Path appears not to be an exercise: " + result.path);
  }

  console.log("Finding silence...");

  const silenceResult = await findSilenceInVideo(latestOBSVideo, {
    silenceDuration: SILENCE_DURATION,
    padding: PADDING,
    threshold: THRESHOLD,
    fps,
  });

  if (silenceResult instanceof CouldNotFindStartTimeError) {
    exitProcessWithError("Could not find start time");
  }

  if (silenceResult instanceof CouldNotFindEndTimeError) {
    exitProcessWithError("Could not find end time");
  }

  const outputFolder = path.dirname(result.resolvedPath) as AbsolutePath;

  await ensureDir(outputFolder);

  console.log("Trimming video...");

  const unNormalizedFilename = (result.resolvedPath.replace(/\.(ts|tsx)/g, "") +
    ".un-encoded.un-normalized.mp4") as AbsolutePath;

  await trimVideo(
    latestOBSVideo,
    unNormalizedFilename,
    silenceResult.startTime,
    silenceResult.endTime,
  );

  const finalOutputFilename = unNormalizedFilename.replace(
    ".un-encoded.un-normalized.mp4",
    ".un-encoded.mp4",
  ) as AbsolutePath;

  await normalizeAudio(unNormalizedFilename, finalOutputFilename);

  await execAsync(`rm ${unNormalizedFilename}`);
};
