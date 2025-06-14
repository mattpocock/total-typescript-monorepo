/**
 * This file contains all direct ffmpeg/ffprobe command executions.
 *
 * Purpose:
 * - Centralize all system command calls to make them easier to mock for testing
 * - Keep business logic separate from system command execution
 * - Make it easier to maintain consistent command parameters
 *
 * Constraints:
 * - Each function should ONLY contain the command execution, no business logic
 * - Functions should be pure wrappers around execAsync calls
 * - All error handling should be minimal and only related to command execution
 * - No complex data processing or transformations
 * - No dependencies on other parts of the codebase
 *
 * When adding new functions:
 * 1. Keep the function focused on a single command execution
 * 2. Move any business logic to the calling code
 * 3. Use consistent parameter naming and error handling
 * 4. Document any non-obvious command parameters
 */

import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { createReadStream } from "fs";
import { err } from "neverthrow";
import { OpenAI } from "openai";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export const createSubtitleFromAudio = async (
  audioPath: AbsolutePath
): Promise<
  {
    start: number;
    end: number;
    text: string;
  }[]
> => {
  const openai = new OpenAI();

  const audioBuffer = createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  return response.segments!.map((segment) => ({
    start: segment.start,
    end: segment.end,
    text: segment.text,
  }));
};

export const transcribeAudio = async (audioPath: AbsolutePath) => {
  if (!audioPath.endsWith(".mp3")) {
    throw new Error("Audio path must end with .mp3");
  }
  const openai = new OpenAI();

  const audioBuffer = createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: "whisper-1",
  });

  return response.text;
};

export class CouldNotGetFPSError extends Error {
  readonly _tag = "CouldNotGetFPSError";
  override message = "Could not get FPS.";
}

export class CouldNotExtractChaptersError extends Error {
  readonly _tag = "CouldNotExtractChaptersError";
  override message = "Could not extract chapters from video file.";
}

export interface RawChapter {
  id: number;
  time_base: string;
  start: number;
  start_time: string;
  end: number;
  end_time: string;
  tags: {
    title: string;
  };
}

export interface ChaptersResponse {
  chapters: RawChapter[];
}

export type FFMPeg = typeof import("./ffmpeg-commands.js");

export const getFPS = (inputVideo: AbsolutePath) => {
  return execAsync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
  )
    .map((output) => {
      const [numerator, denominator] = output.stdout.split("/");
      return Number(numerator) / Number(denominator);
    })
    .orElse(() => {
      return err(new CouldNotGetFPSError());
    });
};

export const getVideoDuration = (inputVideo: AbsolutePath) => {
  return execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputVideo}"`
  ).map((output) => {
    return Number(output.stdout);
  });
};

export const getChapters = (inputVideo: AbsolutePath) => {
  return execAsync(
    `ffprobe -i "${inputVideo}" -show_chapters -v quiet -print_format json`
  )
    .map(({ stdout }) => {
      return JSON.parse(stdout.trim()) as ChaptersResponse;
    })
    .mapErr(() => new CouldNotExtractChaptersError());
};

export const encodeVideo = (
  inputVideo: AbsolutePath,
  outputVideoPath: AbsolutePath
) => {
  return execAsync(
    `ffmpeg -y -hide_banner -i "${inputVideo}" -c:v libx264 -profile high -b:v 7000k -pix_fmt yuv420p -maxrate 16000k "${outputVideoPath}"`
  );
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

export const convertToWav = (
  inputPath: AbsolutePath,
  outputPath: AbsolutePath
) => {
  return execAsync(
    `ffmpeg -i ${inputPath} -ar 16000 -ac 1 -c:a pcm_s16le ${outputPath}`
  );
};

export const normalizeAudio = (input: AbsolutePath, output: AbsolutePath) => {
  return execAsync(`ffmpeg-normalize -f ${input} -o ${output}`);
};

export const extractAudioFromVideo = (
  inputPath: AbsolutePath,
  outputPath: AbsolutePath
) => {
  return execAsync(
    `nice -n 19 ffmpeg -y -hide_banner -hwaccel cuda -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}"`
  ).mapErr((e) => {
    throw new Error(`Failed to extract audio: ${e.message}`);
  });
};

export const createClip = (
  inputVideo: AbsolutePath,
  outputFile: AbsolutePath,
  startTime: number,
  duration: number
) => {
  return execAsync(
    `nice -n 19 ffmpeg -y -hide_banner -ss ${startTime} -i "${inputVideo}" -t ${duration} -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputFile}"`
  );
};

export const concatenateClips = (
  concatFile: AbsolutePath,
  outputVideo: AbsolutePath
) => {
  return execAsync(
    `nice -n 19 ffmpeg -y -hide_banner -f concat -safe 0 -i "${concatFile}" -c:v h264_nvenc -preset slow -rc:v vbr -cq:v 19 -b:v 8000k -maxrate 12000k -bufsize 16000k -c:a aac -b:a 384k "${outputVideo}"`
  );
};

export const overlaySubtitles = (
  inputPath: AbsolutePath,
  subtitlesOverlayPath: AbsolutePath,
  outputPath: AbsolutePath
) => {
  return execAsync(
    `nice -n 19 ffmpeg -y -i "${inputPath}" -i "${subtitlesOverlayPath}" -filter_complex "[0:v][1:v]overlay" -c:a copy "${outputPath}"`
  );
};

export const detectSilence = (
  inputVideo: AbsolutePath,
  threshold: number | string,
  silenceDuration: number | string
) => {
  return execAsync(
    `ffmpeg -hide_banner -vn -i "${inputVideo}" -af "silencedetect=n=${threshold}dB:d=${silenceDuration}" -f null - 2>&1`
  );
};

export const figureOutWhichCTAToShow = async (transcript: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    output: "enum",
    enum: ["ai", "typescript"],
    system: `
      You are deciding which call to action to use for a video.
      The call to action will either point to totaltypescript.com, or aihero.dev.
      Return "ai" if the video is best suited for aihero.dev, and "typescript" if the video is best suited for totaltypescript.com.
      You will receive the full transcript of the video.

      If the video mentions AI, return "ai".
      Or if the video mentions TypeScript, return "typescript".
      If the video mentions Node, return "typescript".
      If the video mentions React, return "typescript".
      
    `,
    prompt: transcript,
  });

  return object;
};

export const renderRemotion = (outputPath: AbsolutePath, cwd: string) => {
  return execAsync(`nice -n 19 npx remotion render MyComp "${outputPath}"`, {
    cwd,
  });
};
