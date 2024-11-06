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
  return serverFunctions.concepts.get({ id: params.conceptId! });
};

export default function Page() {
  const concept = useLoaderData<typeof loader>();

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
    </PageContent>
  );
}
