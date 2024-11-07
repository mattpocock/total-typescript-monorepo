import { redirect } from "@remix-run/react";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { runWorkflowUrl } from "~/routes";
import { createJsonAction } from "~/utils";

export type MultiJsonInput =
  | {
      type: "UPDATE_WORKFLOW_STEP";
      id: string;
      prompt: string;
    }
  | {
      type: "DELETE_WORKFLOW_STEP";
      id: string;
    }
  | {
      type: "UPDATE_WORKFLOW_RUN_STEP";
      stepId: string;
      runId: string;
      input?: string;
      output?: string;
    }
  | {
      type: "EXECUTE_WORKFLOW_STEP";
      stepId: string;
      runId: string;
    }
  | {
      type: "ADD_WORKFLOW_STEP";
      workflowId: string;
      prompt: string;
    }
  | {
      type: "ADD_WORKFLOW_STEP_AFTER";
      stepId: string;
      prompt: string;
    };

export const action = createJsonAction(async (json: MultiJsonInput) => {
  switch (json.type) {
    case "UPDATE_WORKFLOW_STEP":
      await serverFunctions.workflows.steps.update({
        id: json.id,
        prompt: json.prompt,
      });
      return null;
    case "ADD_WORKFLOW_STEP":
      await serverFunctions.workflows.steps.create({
        workflowId: json.workflowId,
        prompt: json.prompt,
      });
      return null;
    case "DELETE_WORKFLOW_STEP":
      await serverFunctions.workflows.steps.delete({
        id: json.id,
      });
      return null;
    case "UPDATE_WORKFLOW_RUN_STEP":
      await serverFunctions.workflows.runs.runSteps.upsert({
        stepId: json.stepId,
        runId: json.runId,
        input: json.input,
        output: json.output,
      });
      return null;
    case "EXECUTE_WORKFLOW_STEP":
      await serverFunctions.workflows.runs.runSteps.execute({
        stepId: json.stepId,
        runId: json.runId,
      });
      return null;
    case "ADD_WORKFLOW_STEP_AFTER":
      const step = await serverFunctions.workflows.steps.createAfterStep({
        prompt: json.prompt,
        afterStepId: json.stepId,
      });
      return null;
  }

  json satisfies never;
});
