import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { DeleteIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContent, TitleArea } from "~/components";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import { runWorkflowUrl } from "~/routes";
import { useDebounceJsonFetcher, useJsonFetcher } from "~/use-json-fetcher";
import { createFormDataAction } from "~/utils";

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {
      title: "Run Workflow | WCM",
    },
  ];
};

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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const result = await serverFunctions.workflows.runs.get({
    id: params.runId!,
  });

  return result;
};

export default function Page() {
  const workflowRun = useLoaderData<typeof loader>();

  const fetcher = useJsonFetcher();

  return (
    <PageContent>
      <TitleArea
        title={`Run ${workflowRun.workflow.title}`}
        breadcrumbs={
          <>
            {workflowRun.concept && (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink to={`/concepts`}>Concepts</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      to={`/concepts/${workflowRun.concept.id}/edit`}
                    >
                      {workflowRun.concept.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbItem>
                      {workflowRun.workflow.title}
                    </BreadcrumbItem>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </>
        }
      ></TitleArea>
      {workflowRun.concept && (
        <div>
          <h2>Concept</h2>
          <p>{workflowRun.concept.title}</p>
        </div>
      )}
      {workflowRun.workflow.steps.map((step, index) => {
        const runStep = workflowRun.steps.find((s) => s.stepId === step.id);
        return (
          <WorkflowStep
            key={step.id}
            prompt={step.prompt}
            input={runStep?.input}
            output={runStep?.output ?? ""}
            stepId={step.id}
            runId={workflowRun.id}
            index={index}
          />
        );
      })}
      {workflowRun.steps.length === 0 && (
        <Button
          onClick={() => {
            fetcher.submit({
              type: "ADD_WORKFLOW_STEP",
              workflowId: workflowRun.workflow.id,
              prompt: "",
            });
          }}
        >
          <PlusIcon />
        </Button>
      )}
    </PageContent>
  );
}

export const WorkflowStep = (props: {
  prompt: string;
  stepId: string;
  runId: string;
  input: string | null | undefined;
  output: string;
  index: number;
}) => {
  const jsonFetcher = useDebounceJsonFetcher();

  const executeFetcher = useJsonFetcher();

  const addNewFetcher = useJsonFetcher();

  const [isEditingOutput, setIsEditingOutput] = useState(false);

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
        <div className=" flex items-center space-x-6">
          <h2 className="text-xl font-semibold">Step {props.index + 1}</h2>
          <Button
            onClick={() => {
              jsonFetcher.submit({
                type: "DELETE_WORKFLOW_STEP",
                id: props.stepId,
              });
            }}
          >
            <DeleteIcon />
          </Button>
        </div>
        {props.index === 0 && (
          <LazyLoadedEditor
            name="input"
            defaultValue={props.input ?? ""}
            label="Initial Input"
            height="150px"
            language="md"
            onChange={(value) => {
              jsonFetcher.submit({
                type: "UPDATE_WORKFLOW_RUN_STEP",
                runId: props.runId,
                stepId: props.stepId,
                input: value,
              });
            }}
          />
        )}

        <div className="space-y-4">
          <LazyLoadedEditor
            name="prompt"
            defaultValue={props.prompt ?? ""}
            label="Prompt"
            height="150px"
            language="md"
            onChange={(value) => {
              jsonFetcher.submit({
                type: "UPDATE_WORKFLOW_STEP",
                id: props.stepId,
                prompt: value ?? "",
              });
            }}
          />
          <Button
            onClick={() => {
              executeFetcher.submit({
                type: "EXECUTE_WORKFLOW_STEP",
                runId: props.runId,
                stepId: props.stepId,
              });
              setIsEditingOutput(false);
            }}
          >
            {executeFetcher.state === "submitting" ? "Executing..." : "Execute"}
          </Button>
        </div>
        {isEditingOutput ? (
          <LazyLoadedEditor
            name="output"
            defaultValue={props.output ?? ""}
            label="Output"
            height="400px"
            language="md"
            onChange={(value) => {
              jsonFetcher.submit({
                type: "UPDATE_WORKFLOW_RUN_STEP",
                runId: props.runId,
                stepId: props.stepId,
                output: value ?? "",
              });
            }}
          />
        ) : (
          <div className="w-full bg-gray-800 p-6">
            {props.output
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
              .map((line, index) => (
                <p key={index} className="font-mono">
                  {line}
                </p>
              ))}
            <Button
              onClick={() => setIsEditingOutput(true)}
              variant="secondary"
            >
              Edit
            </Button>
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          addNewFetcher.submit({
            type: "ADD_WORKFLOW_STEP_AFTER",
            stepId: props.stepId,
            prompt: "",
          });
        }}
      >
        <PlusIcon />
      </Button>
    </>
  );
};
