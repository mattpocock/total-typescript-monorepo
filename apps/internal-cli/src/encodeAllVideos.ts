import { encodeVideo } from "@total-typescript/ffmpeg";
import {
  ensureDir,
  execAsync,
  type AbsolutePath,
} from "@total-typescript/shared";
import { rename } from "fs/promises";
import path from "path";
import { POSSIBLE_UNENCODED_FOLDER_LOCATIONS } from "./constants.js";
import { okAsync, ResultAsync, safeTry } from "neverthrow";

export const encodeAllVideos = async () => {
  return safeTry(async function* () {
    for (const folder of POSSIBLE_UNENCODED_FOLDER_LOCATIONS) {
      const { stdout } = yield* execAsync(
        `find ${folder} -type f -name "*.mp4"`
      ).safeUnwrap();

      const inputVideos = stdout
        .trim()
        .split("\n")
        .filter((file) => !path.parse(file).name.startsWith("."))
        .filter((file) => {
          // Should not be in the tests folder
          return !path.parse(file).dir.endsWith("tests");
        })
        .filter((file) => {
          return (
            // Should not be in an un-encoded folder
            !path.parse(file).dir.endsWith("un-encoded") &&
            // Should be a file that ends un-encoded.mp4
            file.endsWith("un-encoded.mp4")
          );
        }) as AbsolutePath[];

      let videoCount = 0;

      for (const videoPath of inputVideos) {
        videoCount++;
        const outputVideoPath = videoPath.replace(
          ".un-encoded.mp4",
          ".mp4"
        ) as AbsolutePath;

        console.log(
          `Encoding ${path.parse(outputVideoPath).name} (${videoCount}/${
            inputVideos.length
          })`
        );

        yield* encodeVideo(videoPath, outputVideoPath).safeUnwrap();

        yield* ensureDir(
          path.resolve(path.parse(outputVideoPath).dir, "un-encoded")
        ).safeUnwrap();

        yield* ResultAsync.fromThrowable(rename, (e) => {
          return new Error(`Could not move file`, {
            cause: e,
          });
        })(
          videoPath,
          path.resolve(
            path.parse(outputVideoPath).dir,
            "un-encoded",
            path.parse(videoPath).base
          )
        ).safeUnwrap();
      }
    }

    return okAsync(void 0);
  }).mapErr((e) => {
    console.error(e);
    process.exit(1);
  });
};
