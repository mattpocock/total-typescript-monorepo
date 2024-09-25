import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { createFileUploadHandler } from "@remix-run/node/dist/upload/fileUploadHandler";
import { normalizeAudio } from "@total-typescript/ffmpeg";
import { type AbsolutePath } from "@total-typescript/shared";
import { p } from "~/db";
import { getAudioPathForExercise } from "~/vscode-utils";

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

  await normalizeAudio(
    uploadedFile.filepath,
    getAudioPathForExercise(exerciseId!)
  );

  await p.exercise.update({
    where: {
      id: exerciseId,
    },
    data: {
      audioRecordingCreated: true,
    },
  });

  return {
    success: true,
  };
};
