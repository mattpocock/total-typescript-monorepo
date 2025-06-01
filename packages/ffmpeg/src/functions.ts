import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { err, ok, safeTry } from "neverthrow";
import { MINIMUM_CLIP_LENGTH_IN_SECONDS } from "./constants.js";
import { getClipsOfSpeakingFromFFmpeg } from "./getSpeakingClips.js";
import { join } from "path";
import { tmpdir } from "os";
import { extractAudioFromVideo } from "./transcribeAudio.js";
import { transcribeAudio } from "./transcribeAudio.js";

export const encodeVideo = (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`
  );
};

export class CouldNotFindStartTimeError extends Error {
  readonly _tag = "CouldNotFindStartTimeError";
  override message = "Could not find video start time.";
}

export class CouldNotFindEndTimeError extends Error {
  readonly _tag = "CouldNotFindEndTimeError";
  override message = "Could not find video end time.";
}

export const findSilenceInVideo = (
  inputVideo: AbsolutePath,
  opts: {
    threshold: number | string;
    silenceDuration: number | string;
    startPadding: number;
    endPadding: number;
    fps: number;
  }
) => {
  return safeTry(async function* () {
    const processStartTime = Date.now();
    console.log("🎥 Processing video:", inputVideo);

    // First, find all speaking clips
    console.log("🔍 Finding speaking clips...");
    const speakingStart = Date.now();
    const { stdout } = yield* execAsync(
      `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${opts.threshold}dB:d=${opts.silenceDuration}" -f null - 2>&1`
    );

    const speakingClips = getClipsOfSpeakingFromFFmpeg(stdout, opts);
    console.log(
      `✅ Found ${speakingClips.length} speaking clips (took ${(Date.now() - speakingStart) / 1000}s)`
    );

    if (!speakingClips[0]) {
      return err(new CouldNotFindStartTimeError());
    }

    const endClip = speakingClips[speakingClips.length - 1];

    if (!endClip) {
      return err(new CouldNotFindEndTimeError());
    }

    const clipStartTime = speakingClips[0].startTime;
    const endTime = endClip.endTime;

    // Create a temporary directory for audio clips
    const tempDir = join(tmpdir(), `speaking-clips-${Date.now()}`);
    yield* execAsync(`mkdir -p "${tempDir}"`);

    // Extract audio for each clip and transcribe in parallel
    console.log("🎙️  Extracting and transcribing audio clips...");
    const transcriptionStart = Date.now();
    let totalExtractTime = 0;
    let totalTranscribeTime = 0;

    const clipsWithTranscription = await Promise.all(
      speakingClips
        .filter((clip) => clip.duration > MINIMUM_CLIP_LENGTH_IN_SECONDS)
        .map(async (clip, index) => {
          const clipStart = Date.now();

          // Extract audio directly from the original video
          const audioPath = join(tempDir, `clip-${index}.mp3`) as AbsolutePath;
          const extractStart = Date.now();
          await execAsync(
            `ffmpeg -y -hide_banner -ss ${clip.startTime} -i "${inputVideo}" -t ${clip.duration} -vn -acodec libmp3lame -q:a 2 "${audioPath}"`
          );
          const extractTime = (Date.now() - extractStart) / 1000;
          totalExtractTime += extractTime;

          // Transcribe the audio
          const transcribeStart = Date.now();
          const transcript = await transcribeAudio(audioPath);
          const transcribeTime = (Date.now() - transcribeStart) / 1000;
          totalTranscribeTime += transcribeTime;

          // Clean up temporary files
          await execAsync(`rm -f "${audioPath}"`);

          console.log(
            `✅ Processed clip ${index + 1}/${speakingClips.length} (took ${(Date.now() - clipStart) / 1000}s total, ${extractTime.toFixed(1)}s extracting, ${transcribeTime.toFixed(1)}s transcribing)`
          );

          return {
            clip,
            transcript,
          };
        })
    );

    console.log(
      `✅ Processed all ${speakingClips.length} clips (took ${(Date.now() - transcriptionStart) / 1000}s total, ${totalExtractTime.toFixed(1)}s extracting, ${totalTranscribeTime.toFixed(1)}s transcribing)`
    );

    // Clean up temporary directory
    yield* execAsync(`rm -rf "${tempDir}"`);

    // Filter out clips with empty transcripts and ensure minimum duration
    console.log("🔍 Filtering clips...");
    const filterStart = Date.now();

    console.dir(clipsWithTranscription, { depth: null });

    const filteredClips = clipsWithTranscription
      .filter(
        ({ transcript, clip }) =>
          transcript.trim().length > 0 &&
          clip.duration > MINIMUM_CLIP_LENGTH_IN_SECONDS
      )
      .map(({ clip }) => clip);
    console.log(
      `✅ Filtered to ${filteredClips.length} clips (took ${(Date.now() - filterStart) / 1000}s)`
    );

    const totalTime = (Date.now() - processStartTime) / 1000;
    console.log(`✅ Successfully processed video! (Total time: ${totalTime}s)`);

    return ok({
      speakingClips: filteredClips,
      startTime: clipStartTime,
      endTime,
      rawStdout: stdout,
    });
  });
};

export const formatFloatForFFmpeg = (num: number) => {
  return num.toFixed(3);
};

export const trimVideo = (
  inputVideo: AbsolutePath,
  outputVideo: AbsolutePath,
  startTime: number,
  endTime: number
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -ss ${formatFloatForFFmpeg(
      startTime
    )} -to ${formatFloatForFFmpeg(
      endTime
    )} -i "${inputVideo}" -c copy "${outputVideo.replaceAll("\\", "")}"`
  );
};
