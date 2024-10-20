import { redirect } from "@remix-run/node";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { courseUrl } from "~/routes";
import { createJsonAction } from "~/utils";

export const action = createJsonAction(async (json, args) => {
  await serverFunctions.sections.reorderAll({
    courseId: args.params.courseId!,
    sectionIds: json,
  });

  return redirect(courseUrl(args.params.courseId!));
});
