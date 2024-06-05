import { encodeVideo } from "@total-typescript/ffmpeg";
import {
  ensureDir,
  execAsync,
  type AbsolutePath,
} from "@total-typescript/shared";
import { rename } from "fs/promises";
import path from "path";
import { POSSIBLE_UNENCODED_FOLDER_LOCATIONS } from "./constants.js";

export const encodeAllVideos = async () => {
  for (const folder of POSSIBLE_UNENCODED_FOLDER_LOCATIONS) {
    const { stdout } = await execAsync(`find ${folder} -type f -name "*.mp4"`);

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
        ".mp4",
      ) as AbsolutePath;

      console.log(
        `Encoding ${path.parse(outputVideoPath).name} (${videoCount}/${
          inputVideos.length
        })`,
      );

      await encodeVideo(videoPath, outputVideoPath);

      await ensureDir(
        path.resolve(path.parse(outputVideoPath).dir, "un-encoded"),
      );

      await rename(
        videoPath,
        path.resolve(
          path.parse(outputVideoPath).dir,
          "un-encoded",
          path.parse(videoPath).base,
        ),
      );
    }
  }
};
