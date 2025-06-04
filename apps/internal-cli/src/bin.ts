#!/usr/bin/env node

import { env } from "@total-typescript/env";
import {
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
  createSpeakingOnlyVideo,
  extractBadTakeMarkersFromFile,
  findSilenceInVideo,
  getFPS,
  isBadTake,
  renderSubtitles,
  SILENCE_DURATION,
  THRESHOLD,
  transcribeAudio,
  type SpeakingClip,
} from "@total-typescript/ffmpeg";
import {
  execAsync,
  toDashCase,
  type AbsolutePath,
} from "@total-typescript/shared";
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import readline from "readline/promises";
import packageJson from "../package.json" with { type: "json" };
import { appendVideoToTimeline } from "./appendVideoToTimeline.js";
import { commands } from "./commands.js";
import { getLatestOBSVideo } from "./getLatestOBSVideo.js";
import { validateWindowsFilename } from "./validateWindowsFilename.js";
import OBSWebSocket from "obs-websocket-js";
import { ok, safeTry } from "neverthrow";

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
  .command("create-auto-edited-video")
  .aliases(["v", "video"])
  .description(
    "Create a new auto-edited video from the latest OBS recording and save it to the export directory"
  )
  .option("-d, --dry-run", "Run without saving to Dropbox")
  .option("-ns, --no-subtitles", "Disable subtitle rendering")
  .action(async (options: { dryRun?: boolean; subtitles?: boolean }) => {
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
      "Enter the name for your video (without extension): "
    );

    rl.close();

    const validationResult = validateWindowsFilename(outputFilename);
    if (!validationResult.isValid) {
      console.error("Error:", validationResult.error);
      process.exit(1);
    }

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

    let finalVideoPath = tempOutputPath;

    if (options.subtitles) {
      const withSubtitlesPath = path.join(
        env.EXPORT_DIRECTORY_IN_UNIX,
        `${outputFilename}-with-subtitles.mp4`
      ) as AbsolutePath;

      await renderSubtitles(tempOutputPath, withSubtitlesPath);
      finalVideoPath = withSubtitlesPath;
    }

    if (options.dryRun) {
      console.log("Dry run mode: Skipping move to shorts directory");
      return;
    }

    // Then move to shorts directory
    const finalOutputPath = path.join(
      env.SHORTS_EXPORT_DIRECTORY,
      `${outputFilename}.mp4`
    ) as AbsolutePath;

    await fs.rename(finalVideoPath, finalOutputPath);
    console.log(`Video moved to: ${finalOutputPath}`);
  });

const waitForNewOBSVideo = async (obs: OBSWebSocket): Promise<AbsolutePath> => {
  return await new Promise((resolve) => {
    obs.on("RecordStateChanged", (data) => {
      if (data.outputState === "OBS_WEBSOCKET_OUTPUT_STOPPED") {
        const filename = path.win32.basename(data.outputPath);
        resolve(
          path.resolve(env.OBS_OUTPUT_DIRECTORY, filename) as AbsolutePath
        );
      }
    });
  });
};

program
  .command("watch-obs-output")
  .aliases(["w", "watch"])
  .description(
    "Watch the OBS output directory for new videos, and display the transcribed text on screen"
  )
  .action(async () => {
    const obs = new OBSWebSocket();

    await obs.connect("ws://192.168.1.55:4455"); // Default OBS WebSocket v5 URL
    console.log("Connected to OBS WebSocket");

    while (true) {
      const inputVideo = await waitForNewOBSVideo(obs);
      console.log(`New video: ${path.basename(inputVideo)}`);

      await safeTry(async function* () {
        const fps = yield* getFPS(inputVideo);

        const { speakingClips } = yield* findSilenceInVideo(inputVideo, {
          threshold: THRESHOLD,
          silenceDuration: SILENCE_DURATION,
          startPadding: AUTO_EDITED_START_PADDING,
          endPadding: AUTO_EDITED_END_PADDING,
          fps,
          log: false,
        });

        const badTakeMarkers = yield* extractBadTakeMarkersFromFile(
          inputVideo,
          fps
        );

        const goodClips = speakingClips.filter((clip, index) => {
          const quality = isBadTake(
            clip,
            badTakeMarkers,
            index,
            speakingClips,
            fps
          );
          return quality === "good";
        });

        const clipsWithTranscription = await Promise.all(
          goodClips.map(async (clip) => {
            const outputAudioFile = path.join(
              env.OBS_OUTPUT_DIRECTORY,
              `clip-${clip.startTime.toFixed(2)}.mp3`
            ) as AbsolutePath;

            const audioCodec = "libmp3lame";

            const cmd = `ffmpeg -y -hide_banner -ss ${clip.startTime.toFixed(2)} -i "${inputVideo}" -t ${clip.duration} -c:a ${audioCodec} -b:a 384k "${outputAudioFile}"`;

            await execAsync(cmd).mapErr((e) => {
              throw e;
            });

            const transcription = await transcribeAudio(outputAudioFile);

            await fs.unlink(outputAudioFile);

            return { transcription, clip };
          })
        );

        console.log(
          clipsWithTranscription
            .map(({ transcription, clip }) => {
              return `${clip.duration.toFixed(1).padStart(5, " ")}s: ${transcription}`;
            })
            .join("\n")
        );

        return ok(undefined);
      });
    }
  });

program.parse(process.argv);
