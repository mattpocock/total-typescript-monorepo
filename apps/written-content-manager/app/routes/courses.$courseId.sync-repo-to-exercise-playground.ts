import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { courseUrl } from "~/routes";

export const action = async (args: ActionFunctionArgs) => {
  await serverFunctions.courses.syncRepoToExercisePlayground({
    id: args.params.courseId!,
  });

  return redirect(courseUrl(args.params.courseId!));
};
