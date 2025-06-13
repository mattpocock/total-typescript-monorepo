import {
  execAsync,
  ExecService,
  type AbsolutePath,
} from "@total-typescript/shared";
import { Effect, pipe } from "effect";
import path from "path";
import { OBS_OUTPUT_DIRECTORY } from "./constants.js";
import { EnvService } from "@total-typescript/env";

const getLatestOBSOutputFile = (dir: AbsolutePath) => {
  return Effect.gen(function* () {
    const env = yield* EnvService;

    const result = yield* execAsync(
      `ls -t ${path.join(dir, `*.${env.videoOutputExtension}`)}`
    );

    return result.stdout.trim().split("\n")[0]!.trim() as AbsolutePath;
  });
};

export const getLatestOBSVideo = () => {
  return getLatestOBSOutputFile(OBS_OUTPUT_DIRECTORY);
};
