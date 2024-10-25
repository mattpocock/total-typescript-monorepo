import type { ActionFunctionArgs } from "@remix-run/node";
import { fs } from "~/fs";
import { serverFunctions } from "~/modules/server-functions/server-functions";

export const action = async (args: ActionFunctionArgs) => {
  const { coursePath } = await serverFunctions.courses.printToRepo({
    id: args.params.courseId!,
  });

  await fs.openInVSCode(coursePath);

  return null;
};
