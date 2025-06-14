import readline from "readline/promises";
import prompts from "prompts";
import { type AbsolutePath } from "@total-typescript/shared";

const { prompt } = prompts;

export const promptForFilename = async (): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const outputFilename = await rl.question(
    "Enter the name for your video (without extension): "
  );

  rl.close();

  // Ensure the readline interface is closed when the process exits
  process.on("beforeExit", () => {
    rl.close();
  });

  return outputFilename;
};

export const promptForVideoSelection = async (
  videos: Array<{ title: string; value: AbsolutePath; mtime: Date }>
): Promise<AbsolutePath | undefined> => {
  const { selectedVideo } = await prompt({
    type: "select",
    name: "selectedVideo",
    message: "Choose a video to transcribe:",
    choices: videos.map(({ title, value }) => ({ title, value })),
  });

  return selectedVideo;
};