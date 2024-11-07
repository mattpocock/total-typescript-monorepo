import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
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
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { p } from "~/db";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import { createRunUrl, runWorkflowUrl } from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { createFormDataAction } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Edit Concept | WCM",
    },
  ];
};

export const action = createFormDataAction(async (json, args) => {
  await serverFunctions.concepts.update({
    id: args.params.conceptId!,
    ...json,
  });
  return null;
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const [concept, workflowsNotInConcept] = await Promise.all([
    serverFunctions.concepts.get({ id: params.conceptId! }),
    p.contentWorkflow.findMany({
      select: {
        id: true,
        title: true,
      },
      where: {
        deletedAt: null,
        runs: {
          none: {
            conceptId: params.conceptId!,
          },
        },
      },
    }),
  ]);

  return {
    concept,
    workflows: workflowsNotInConcept,
  };
};

export default function Page() {
  const { concept, workflows } = useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

  const fetcher = useFetcher();

  return (
    <PageContent>
      <TitleArea
        title="Edit Concept"
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to={`/concepts`}>Concepts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbItem>{concept.title}</BreadcrumbItem>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <Form method="POST" ref={formRef}>
        <FormContent>
          <Input
            name="title"
            defaultValue={concept.title}
            required
            autoFocus
            onChange={handleChange}
          />
          <LazyLoadedEditor
            label="Content"
            defaultValue={concept.content}
            className="col-span-full"
            language="md"
            name="content"
            onChange={handleChange}
          />
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {concept.workflowRuns.map((workflowRun) => (
            <TableRow key={workflowRun.workflow.id}>
              <TableCell>
                <Link
                  prefetch="intent"
                  to={runWorkflowUrl(workflowRun.id)}
                  className="text-base"
                >
                  <h2>{workflowRun.workflow.title}</h2>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <Combobox
          defaultValue=""
          name="postId"
          options={workflows.map((workflow) => ({
            label: workflow.title,
            value: workflow.id,
          }))}
          className="min-w-64"
          placeholder="Add Workflow..."
          emptyText="No workflows found"
          onChange={({ value, reset }) => {
            fetcher.submit(
              {
                conceptId: concept.id,
              },
              {
                action: createRunUrl(value),
                method: "POST",
              }
            );
          }}
        />
      </div>
    </PageContent>
  );
}
