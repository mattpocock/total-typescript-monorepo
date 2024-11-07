import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { FormButtons, FormContent, PageContent, TitleArea } from "~/components";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { p } from "~/db";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { createFormDataAction } from "~/utils";
import { WorkflowRunnerPage } from "~/workflow-runner-page";

export const meta: MetaFunction<typeof loader> = () => {
  return [
    {
      title: "Edit Workflow | WCM",
    },
  ];
};

export const action = createFormDataAction(async (json, args) => {
  const result = await serverFunctions.workflows.runs.create({
    workflowId: args.params.workflowId!,
  });

  const concept = await serverFunctions.workflows.runs.linkToConcept({
    conceptId: args.params.conceptId!,
    workflowRunId: result.id,
  });

  return;
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const result = await p.contentWorkflowRunToConcept.upsert({
    create: {
      conceptId: params.conceptId!,
      run: {
        connectOrCreate: {
          where: {
            workflowId: params.workflowId!,
          },
        },
      },
    },
  });
};

export default function Page() {
  const { workflow, concept } = useLoaderData<typeof loader>();

  return (
    <WorkflowRunnerPage pageTitle={`${concept.title} - ${workflow.title}`} />
  );
}
