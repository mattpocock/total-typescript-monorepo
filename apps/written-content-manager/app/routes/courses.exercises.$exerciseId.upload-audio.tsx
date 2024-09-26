import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { createFileUploadHandler } from "@remix-run/node/dist/upload/fileUploadHandler";
import {
  convertToWav,
  normalizeAudio,
  transcribeAudio,
} from "@total-typescript/ffmpeg";
import { ensureDir, type AbsolutePath } from "@total-typescript/shared";
import { readFile, rm } from "node:fs/promises";
import { p } from "~/db";
import { getAudioPathForExercise, getExerciseDir } from "~/vscode-utils";

export const action = async (args: ActionFunctionArgs) => {
  const { exerciseId } = args.params;

  // Check exercise exists!
  await p.exercise.findUniqueOrThrow({
    where: {
      id: exerciseId,
    },
  });

  const uploadHandler = unstable_composeUploadHandlers(
    createFileUploadHandler({
      directory: "public/uploads",
      maxPartSize: Infinity,
    }),
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    args.request,
    uploadHandler
  );

  const uploadedFile = formData.get("file") as any as {
    filepath: AbsolutePath;
  };

  const mkvFilePath = getAudioPathForExercise(exerciseId!);
  const wavFilePath = mkvFilePath.replace(/\.mkv$/, ".wav") as AbsolutePath;

  await normalizeAudio(uploadedFile.filepath, mkvFilePath)
    .mapErr(() => {
      throw new Response("Failed to normalize audio", {
        status: 500,
      });
    })
    .andThen(() => convertToWav(mkvFilePath, wavFilePath))
    .mapErr(() => {
      throw new Response("Failed to convert audio to wav", {
        status: 500,
      });
    })
    .andThen(() => transcribeAudio(wavFilePath))
    .mapErr(() => {
      throw new Response("Failed to transcribe audio", {
        status: 500,
      });
    });

  const transcriptPath = mkvFilePath.replace(/\.mkv$/, ".wav.txt");

  const transcriptText = await readFile(transcriptPath, "utf-8");

  await Promise.all([
    p.exercise.update({
      where: {
        id: exerciseId,
      },
      data: {
        audioRecordingCreated: true,
        audioTranscript: transcriptText,
      },
    }),
    p.analyticsEvent.create({
      data: {
        type: "EXERCISE_AUDIO_RECORDING_CREATED",
        payload: {
          exerciseId,
        },
      },
    }),
    rm(transcriptPath, { force: true }),
    rm(wavFilePath, { force: true }),
  ]);

  return {
    success: true,
  };
};
