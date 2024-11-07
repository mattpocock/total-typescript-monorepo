import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { runWorkflowUrl } from "~/routes";
import { createFormDataAction } from "~/utils";

export const action = createFormDataAction(async (json, args) => {
  const result = await serverFunctions.workflows.runs.create({
    workflowId: args.params.workflowId!,
  });

  if (json.conceptId) {
    await serverFunctions.workflows.runs.linkToConcept({
      conceptId: json.conceptId,
      workflowRunId: result.id,
    });
  }

  return redirect(runWorkflowUrl(result.id));
});
