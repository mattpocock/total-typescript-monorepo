import { type AbsolutePath } from "@total-typescript/shared";
import { createReadStream } from "fs";
import { OpenAI } from "openai";
import {
  convertToWav,
  normalizeAudio,
  extractAudioFromVideo,
} from "./ffmpeg-commands.js";

export { convertToWav, normalizeAudio, extractAudioFromVideo };

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

export const transcribeAudio = async (audioPath: AbsolutePath) => {
  if (!audioPath.endsWith(".mp3")) {
    throw new Error("Audio path must end with .mp3");
  }

  const audioBuffer = createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: "whisper-1",
  });

  return response.text;
};
