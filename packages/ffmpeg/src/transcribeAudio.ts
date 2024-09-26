import { execAsync, type AbsolutePath } from "@total-typescript/shared";
import { homedir } from "os";
import path from "path";

const WHISPER_CPP_LOCATION = path.join(
  homedir(),
  "repos",
  "oss",
  "whisper.cpp"
);

/**
 * Must take in a wav file
 *
 * Prints out a text file. audio.wav -> audio.wav.txt
 */
export const transcribeAudio = (audioPath: AbsolutePath) => {
  return execAsync(`./main -nt -otxt ${audioPath}`, {
    cwd: WHISPER_CPP_LOCATION,
  });
};
