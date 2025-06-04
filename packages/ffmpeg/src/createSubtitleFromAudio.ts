import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { createReadStream } from "fs";
import { OpenAI } from "openai";

export const extractAudioFromVideo = async (
  inputPath: AbsolutePath,
  outputPath: AbsolutePath
): Promise<void> => {
  await execAsync(
    `nice -n 19 ffmpeg -y -hide_banner -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}"`
  ).mapErr((e) => {
    throw new Error(`Failed to extract audio: ${e.message}`);
  });
};

const openai = new OpenAI();

export const createSubtitleFromAudio = async (
  audioPath: AbsolutePath
): Promise<
  {
    start: number;
    end: number;
    text: string;
  }[]
> => {
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

export const transcribeAudio = async (
  audioPath: AbsolutePath
): Promise<string> => {
  const audioBuffer = createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: "whisper-1",
  });

  return response.text;
};
