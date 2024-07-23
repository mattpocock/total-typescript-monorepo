import { exec } from "child_process";
import { homedir } from "os";
import path from "path";

const WHISPER_CPP_LOCATION = path.join(
  homedir(),
  "repos",
  "oss",
  "whisper.cpp",
);

const cmd = `./stream -m ./models/ggml-base.en.bin -t 6 --step 0 --length 20000 -vth 0.6`;

namespace transcribeAudio {
  export interface Input {
    onTranscriptionChange: (transcription: string) => void;
  }

  export interface Output {
    close: () => void;
  }
}

export const transcribeAudio = (
  input: transcribeAudio.Input,
): transcribeAudio.Output => {
  const childProcess = exec(cmd, {
    cwd: WHISPER_CPP_LOCATION,
  });

  childProcess.on("error", (err) => {
    console.error(err);
  });

  childProcess.stdout?.on("data", (data) => {
    input.onTranscriptionChange(data.toString());
  });

  return {
    close: () => {
      childProcess.kill();
    },
  };
};
