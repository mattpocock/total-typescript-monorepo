import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  getAudioPathForExercise,
  getDoesAudioExistForExercise,
} from "~/vscode-utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const audioPath = getAudioPathForExercise(params.exerciseId!);

  const exists = await getDoesAudioExistForExercise(params.exerciseId!);

  if (!exists) {
    return json(
      {
        error: "Audio does not exist for this exercise",
      },
      {
        status: 404,
      }
    );
  }

  const fs = await import("node:fs/promises");

  const audio = await fs.readFile(audioPath);

  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mkv",
      "Content-Disposition": 'inline; filename="audio.mkv"',
    },
  });
};
