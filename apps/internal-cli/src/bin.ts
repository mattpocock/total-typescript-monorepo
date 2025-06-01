#!/usr/bin/env node

import { Command } from "commander";
import { commands } from "./commands.js";
import {
  execAsync,
  toDashCase,
  type AbsolutePath,
} from "@total-typescript/shared";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import {
  createSpeakingOnlyVideo,
  createSubtitleFromAudio,
  getFPS,
} from "@total-typescript/ffmpeg";
import path from "path";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import { env } from "@total-typescript/env";
import readline from "readline/promises";
import fs from "fs/promises";
import { extractAudioFromVideo } from "@total-typescript/ffmpeg";

const program = new Command();

program.version(packageJson.version);

commands.forEach((command) => {
  let cliCommand = command.cliCommand;

  if (command.args) {
    cliCommand += ` ${command.args
      .map((arg) => {
        return `<${toDashCase(arg)}>`;
      })
      .join(" ")}`;
  }

  program
    .command(cliCommand)
    .action(command.run)
    .description(command.description);
});

program
  .command("append-video-to-timeline [video]")
  .aliases(["a", "append"])
  .description("Append video to the current timeline")
  .action(async (video: string | undefined) => {
    await appendVideoToTimeline(video);
  });

program
  .command("create-short")
  .aliases(["s", "short"])
  .description(
    "Create a new short video from the latest OBS recording and save it to the shorts export directory"
  )
  .option("-d, --dry-run", "Run without saving to Dropbox")
  .action(async (options: { dryRun?: boolean }) => {
    const latestVideoResult = await getLatestOBSVideo();
    if (latestVideoResult.isErr()) {
      console.error("Failed to get latest OBS video:", latestVideoResult.error);
      process.exit(1);
    }

    const latestVideo = latestVideoResult.value;

    // Prompt for the output filename
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const outputFilename = await rl.question(
      "Enter the name for your short (without extension): "
    );

    // Ensure the readline interface is closed
    // when the process exits
    process.on("beforeExit", () => {
      rl.close();
    });

    // First create in the export directory
    const tempOutputPath = path.join(
      env.EXPORT_DIRECTORY_IN_UNIX,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    await createSpeakingOnlyVideo(latestVideo, tempOutputPath);
    console.log(`Video created successfully at: ${tempOutputPath}`);

    if (options.dryRun) {
      console.log("Dry run mode: Skipping move to shorts directory");
      rl.close();
      return;
    }

    // Then move to shorts directory
    const finalOutputPath = path.join(
      env.SHORTS_EXPORT_DIRECTORY,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    await fs.rename(tempOutputPath, finalOutputPath);
    console.log(`Short moved to: ${finalOutputPath}`);

    rl.close();
  });

program
  .command("transcribe-latest")
  .aliases(["t", "transcribe"])
  .description("Transcribe the most recent video in the export directory")
  .action(async () => {
    // Get all files in the export directory
    const files = await fs.readdir(env.EXPORT_DIRECTORY_IN_UNIX);

    // Filter for video files and get their stats
    const videoFiles = await Promise.all(
      files
        .filter((file) => file.endsWith(".mp4"))
        .map(async (file) => {
          const filePath = path.join(env.EXPORT_DIRECTORY_IN_UNIX, file);
          const stats = await fs.stat(filePath);
          return { file, stats };
        })
    );

    if (videoFiles.length === 0) {
      console.error("No video files found in export directory");
      process.exit(1);
    }

    // Sort by creation time and get the most recent
    const latestVideo = videoFiles.sort(
      (a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime()
    )[0];

    if (!latestVideo) {
      console.error("No video files found in export directory");
      process.exit(1);
    }

    const videoPath = path.join(
      env.EXPORT_DIRECTORY_IN_UNIX,
      latestVideo.file
    ) as AbsolutePath;
    const audioPath = path.join(
      env.EXPORT_DIRECTORY_IN_UNIX,
      `${latestVideo.file}.mp3`
    ) as AbsolutePath;

    console.log(`Processing video: ${latestVideo.file}`);

    try {
      // Extract audio
      await extractAudioFromVideo(videoPath, audioPath);
      console.log("Audio extracted successfully");

      // Transcribe audio
      const subtitles = await createSubtitleFromAudio(audioPath);

      const fps = (await getFPS(videoPath))._unsafeUnwrap();

      const subtitlesAsFrames = subtitles.map((subtitle) => ({
        startFrame: Math.floor(subtitle.start * fps),
        endFrame: Math.floor(subtitle.end * fps),
        text: subtitle.text.trim(),
      }));

      const REMOTION_DIR = path.resolve(
        import.meta.dirname,
        "../../remotion-subtitle-renderer"
      );

      const JSON_FILE_PATH = path.join(
        REMOTION_DIR,
        "src",
        "subtitle.json"
      ) as AbsolutePath;

      await fs.writeFile(JSON_FILE_PATH, JSON.stringify(subtitlesAsFrames));

      // Copy the video to the remotion directory
      await fs.copyFile(
        videoPath,
        path.join(REMOTION_DIR, "public", "input.mp4") as AbsolutePath
      );

      const cmd = `nice -n 19 npx remotion render MyComp ${REMOTION_DIR}/out/subtitle.mp4`;

      console.log("Rendering subtitle...");
      await execAsync(cmd, {
        cwd: REMOTION_DIR,
      })
        .mapErr((e) => {
          console.error("Error rendering subtitle:", e);
          process.exit(1);
        })
        .map(() => {
          console.log("Subtitle rendered successfully");
        });

      // Clean up the temporary audio file
      await fs.unlink(audioPath);
    } catch (error) {
      console.error("Error processing video:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);
