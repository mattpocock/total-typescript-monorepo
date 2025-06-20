import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { Config, Effect } from "effect";
import path from "path";

export const getLatestOBSFile = (dir: AbsolutePath) => {
  return Effect.gen(function* () {
    const OBS_FILE_EXTENSION = yield* Config.string("OBS_FILE_EXTENSION");

    const result = yield* execAsync(
      `ls -t ${path.join(dir, `*.${OBS_FILE_EXTENSION}`)}`
    );

    return result.stdout.trim().split("\n")[0]!.trim() as AbsolutePath;
  });
};

export const getLatestOBSVideo = () => {
  return Effect.gen(function* () {
    const obsOutputDirectory = yield* Config.string("OBS_OUTPUT_DIRECTORY");
    return yield* getLatestOBSFile(obsOutputDirectory as AbsolutePath);
  });
};
