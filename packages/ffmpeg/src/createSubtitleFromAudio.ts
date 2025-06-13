import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { Effect, pipe } from "effect";
import { createReadStream } from "fs";
import { OpenAI } from "openai";

class CouldNotExtractAudioError extends Error {
  readonly _tag = "CouldNotExtractAudioError";
}

export const extractAudioFromVideo = (
  inputPath: AbsolutePath,
  outputPath: AbsolutePath
) => {
  return pipe(
    execAsync(
      `nice -n 19 ffmpeg -y -hide_banner -hwaccel cuda -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}"`
    ),
    Effect.catchAll((e) => {
      return Effect.fail(new CouldNotExtractAudioError());
    })
  );
};

const openai = new OpenAI();

export const createSubtitleFromAudio = (
  audioPath: AbsolutePath
): Effect.Effect<
  {
    start: number;
    end: number;
    text: string;
  }[]
> => {
  return Effect.promise(async (signal) => {
    const audioBuffer = createReadStream(audioPath, { signal });

    const response = await openai.audio.transcriptions.create(
      {
        file: audioBuffer,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
      },
      {
        signal,
      }
    );

    return response.segments!.map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
    }));
  });
};

class AudioPathMustEndWithMP3Error extends Error {
  readonly _tag = "AudioPathMustEndWithMP3Error";
}

export const transcribeAudio = (
  audioPath: AbsolutePath
): Effect.Effect<string, AudioPathMustEndWithMP3Error> => {
  if (!audioPath.endsWith(".mp3")) {
    return Effect.fail(new AudioPathMustEndWithMP3Error());
  }

  return Effect.promise(async (signal) => {
    const audioBuffer = createReadStream(audioPath, { signal });

    const response = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: "whisper-1",
    });

    return response.text;
  });
};
