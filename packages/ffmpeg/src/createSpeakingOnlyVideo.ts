import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { err, ok, safeTry } from "neverthrow";
import {
  AUTO_EDITED_END_PADDING,
  AUTO_EDITED_START_PADDING,
  AUTO_EDITED_VIDEO_FINAL_END_PADDING,
  SILENCE_DURATION,
  THRESHOLD,
} from "./constants.js";
import {
  extractBadTakeMarkersFromFile,
  isBadTake,
} from "./extractChaptersFromFile.js";
import { findSilenceInVideo } from "./functions.js";
import { getFPS } from "./getFPS.js";

export class CouldNotCreateSpeakingOnlyVideoError extends Error {
  readonly _tag = "CouldNotCreateSpeakingOnlyVideoError";
  override message = "Could not create speaking-only video.";
}

export class FFMPegWithComplexFilterError extends Error {
  readonly _tag = "FFMPegWithComplexFilterError";
  override message = "FFMPEG with complex filter failed.";
  readonly stdout: string | undefined;
  readonly stderr: string | undefined;
  constructor(opts: {
    stdout: string | undefined;
    stderr: string | undefined;
  }) {
    super();
    this.stdout = opts.stdout;
    this.stderr = opts.stderr;
  }
}

export const createSpeakingOnlyVideo = (
  inputVideo: AbsolutePath,
  outputVideo: AbsolutePath
) => {
  return safeTry(async function* () {
    console.log("🎥 Processing video:", inputVideo);
    console.log("📝 Output will be saved to:", outputVideo);

    // Get the video's FPS
    console.log("⏱️  Detecting video FPS...");
    const fps = yield* getFPS(inputVideo);
    console.log("✅ Detected FPS:", fps);

    // First, find all speaking clips
    console.log("🔍 Finding speaking clips...");
    const { speakingClips } = yield* findSilenceInVideo(inputVideo, {
      threshold: THRESHOLD,
      silenceDuration: SILENCE_DURATION,
      startPadding: AUTO_EDITED_START_PADDING,
      endPadding: AUTO_EDITED_END_PADDING,
      fps,
    });
    console.log(`✅ Found ${speakingClips.length} speaking clips`);

    // Then get all bad take markers
    console.log("🎯 Extracting bad take markers...");
    const badTakeMarkers = yield* extractBadTakeMarkersFromFile(
      inputVideo,
      fps
    );
    console.log(`✅ Found ${badTakeMarkers.length} bad take markers`);

    // Filter out bad takes
    console.log("🔍 Filtering out bad takes...");
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
    console.log(`✅ Found ${goodClips.length} good clips`);

    if (goodClips.length === 0) {
      console.log("❌ No good clips found");
      yield* err(new CouldNotCreateSpeakingOnlyVideoError());
    }

    // Create a complex filter to concatenate all good clips
    console.log("🎬 Creating FFmpeg filter...");
    const filterComplex = goodClips
      .map((clip, i, arr) => {
        const startTime = clip.startTime;

        const isLastClip = i === arr.length - 1;

        // If this is the last clip, add the final padding
        const duration = isLastClip
          ? clip.duration + AUTO_EDITED_VIDEO_FINAL_END_PADDING
          : clip.duration;
        return `[0:v]trim=start=${startTime}:duration=${duration},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${startTime}:duration=${duration},asetpts=PTS-STARTPTS[a${i}];`;
      })
      .join("");

    const videoInputs = goodClips.map((_, i) => `[v${i}]`).join("");
    const audioInputs = goodClips.map((_, i) => `[a${i}]`).join("");

    const concatFilter = `${filterComplex}${videoInputs}concat=n=${goodClips.length}:v=1:a=0[outv];${audioInputs}concat=n=${goodClips.length}:v=0:a=1[outa]`;

    // Run ffmpeg with the complex filter
    console.log("🎥 Creating final video...");
    yield* execAsync(
      `ffmpeg -y -hide_banner -i "${inputVideo}" -filter_complex "${concatFilter}" -map "[outv]" -map "[outa]" -c:v libx264 -c:a aac "${outputVideo}"`
    ).mapErr((e) => {
      console.log(e);
      return new FFMPegWithComplexFilterError({
        stdout: e.stdout,
        stderr: e.stderr,
      });
    });

    console.log("✅ Successfully created speaking-only video!");
    return ok(undefined);
  }).mapErr((e) => {
    if ("stdout" in e) {
      console.error("❌ FFmpeg error:");
      console.error(e.message);
      console.error("FFmpeg stdout:", e.stdout);
      console.error("FFmpeg stderr:", e.stderr);
      process.exit(1);
    }
    console.error("❌ Error:", e.message);
    process.exit(1);
  });
};
