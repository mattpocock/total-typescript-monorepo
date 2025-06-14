import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { createReadStream } from "fs";
import { OpenAI } from "openai";

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

export const extractAudioFromVideo = async (
  inputPath: AbsolutePath,
  outputPath: AbsolutePath
): Promise<void> => {
  await execAsync(
    `nice -n 19 ffmpeg -y -hide_banner -hwaccel cuda -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}"`
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