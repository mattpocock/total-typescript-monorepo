import type { ActionFunctionArgs } from "@remix-run/node";
import { fs } from "~/fs";
import { serverFunctions } from "~/modules/server-functions/server-functions";

export const action = async (args: ActionFunctionArgs) => {
  await serverFunctions.courses.syncRepoToExercisePlayground({
    id: args.params.courseId!,
  });

  return null;
};
