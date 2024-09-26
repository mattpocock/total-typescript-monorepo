import { convertToWav, transcribeAudio } from "@total-typescript/ffmpeg";
import type { AbsolutePath } from "@total-typescript/shared";
import path from "node:path";

const dir = path.join(
  import.meta.dirname,
  "../../",
  "exercise-playground",
  "src",
  "0e67dd79-643a-4733-a9c9-876d741ab6e2"
);

const mkvFilePath = path.join(dir, "audio.mkv") as AbsolutePath;

const wavFilePath = path.join(dir, "audio.wav") as AbsolutePath;

console.log(wavFilePath);

await convertToWav(mkvFilePath, wavFilePath);

const result = await transcribeAudio(wavFilePath);
