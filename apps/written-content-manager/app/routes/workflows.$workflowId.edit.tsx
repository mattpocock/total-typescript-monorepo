import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import {
  FormButtons,
  FormContent,
  PageContent,
  PageTitle,
  TitleArea,
} from "~/components";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import { courseUrl, sectionUrl } from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { createFormDataAction } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Edit Workflow | WCM",
    },
  ];
};

export const action = createFormDataAction(async (json, args) => {
  await serverFunctions.workflows.update({
    id: args.params.workflowId!,
    ...json,
  });
  return null;
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return serverFunctions.workflows.get({ id: params.workflowId! });
};

export default function Page() {
  const workflow = useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

  return (
    <PageContent>
      <TitleArea
        title="Edit Workflow"
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to={`/workflows`}>Workflows</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbItem>{workflow.title}</BreadcrumbItem>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <Form method="POST" ref={formRef}>
        <FormContent>
          <Input
            name="title"
            defaultValue={workflow.title}
            required
            autoFocus
            onChange={handleChange}
          />
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </PageContent>
  );
}
