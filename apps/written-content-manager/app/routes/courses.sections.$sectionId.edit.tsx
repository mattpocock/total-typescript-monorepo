import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
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
import { p } from "~/db";
import { coursesUrl, courseUrl, sectionUrl } from "~/routes";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Edit ${data?.title} | WCM`,
    },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sectionId } = params;
  const section = await p.section.findUniqueOrThrow({
    where: {
      id: sectionId,
    },
    select: {
      id: true,
      title: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return section;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { sectionId } = params;
  const body = await request.formData();

  const title = body.get("title") as string;

  await p.section.update({
    where: {
      id: sectionId,
    },
    data: {
      title,
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? sectionUrl(sectionId as string));
};

export default function Section() {
  const section = useLoaderData<typeof loader>();

  return (
    <PageContent>
      <TitleArea
        title="Edit Section"
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to={courseUrl(section.course.id)}>
                  {section.course.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink to={sectionUrl(section.id)}>
                  {section.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbItem>Edit</BreadcrumbItem>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <Form method="POST">
        <FormContent>
          <Input name="title" defaultValue={section.title} required autoFocus />
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </PageContent>
  );
}
