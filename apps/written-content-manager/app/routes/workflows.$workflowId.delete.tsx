import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (json, args) => {
  await serverFunctions.workflows.delete({
    id: args.params.workflowId!,
  });
  return redirect("/workflows");
});
