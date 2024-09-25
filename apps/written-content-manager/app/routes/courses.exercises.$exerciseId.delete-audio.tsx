import { type ActionFunctionArgs } from "@remix-run/node";
import { rm } from "fs/promises";
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

  await rm(getAudioPathForExercise(exerciseId!), {
    force: true,
  });

  return {};
};
