import { openai } from "@ai-sdk/openai";
import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { experimental_transcribe as transcribe } from "ai";
import { readFile } from "fs/promises";

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

export const transcribeAudio = async (
  audioPath: AbsolutePath
): Promise<string> => {
  const audioBuffer = await readFile(audioPath);

  try {
    const transcript = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: audioBuffer,
      providerOptions: {
        openai: {
          prompt: `Only transcribe if there is clear human speech.`,
          temperature: 0,
        },
      },
      maxRetries: 0,
    });

    return transcript.text;
  } catch (e) {
    if (e instanceof Error && e.message.includes("No transcript generated")) {
      return "";
    }

    throw e;
  }
};

export const detectVoice = async (
  audioPath: AbsolutePath
): Promise<boolean> => {
  const transcript = await transcribeAudio(audioPath);
  return transcript.trim().length > 0;
};
