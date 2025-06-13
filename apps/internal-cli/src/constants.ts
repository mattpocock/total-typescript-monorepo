import { env } from "@total-typescript/env";
import { type AbsolutePath } from "@total-typescript/shared";

export const OBS_OUTPUT_DIRECTORY = env.OBS_OUTPUT_DIRECTORY as AbsolutePath;
