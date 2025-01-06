import { env } from "@total-typescript/env";
import {
  ExternalDriveNotFoundError,
  pathExists,
  type AbsolutePath,
} from "@total-typescript/shared";
import { err, ok } from "neverthrow";

export const OBS_OUTPUT_DIRECTORY = env.OBS_OUTPUT_DIRECTORY as AbsolutePath;

export const getExternalDrive = () => {
  return pathExists(OBS_OUTPUT_DIRECTORY).andThen((exists) => {
    if (exists) {
      return ok(OBS_OUTPUT_DIRECTORY);
    }
    return err(new ExternalDriveNotFoundError(OBS_OUTPUT_DIRECTORY));
  });
};

/**
 * Places where unencoded footage might be located.
 */
export const POSSIBLE_UNENCODED_FOLDER_LOCATIONS = [
  OBS_OUTPUT_DIRECTORY,
] as AbsolutePath[];
