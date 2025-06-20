import { type AbsolutePath } from "@total-typescript/shared";
import { env } from "./env.js";

export const OBS_OUTPUT_DIRECTORY = env.OBS_OUTPUT_DIRECTORY as AbsolutePath;

/**
 * Places where unencoded footage might be located.
 */
export const POSSIBLE_UNENCODED_FOLDER_LOCATIONS = [
  OBS_OUTPUT_DIRECTORY,
] as AbsolutePath[];
