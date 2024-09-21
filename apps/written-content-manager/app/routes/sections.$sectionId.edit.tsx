import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sectionId } = params;
  const section = await p.section.findUniqueOrThrow({
    where: {
      id: sectionId,
    },
    select: {
      id: true,
      title: true,
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

  return redirect(redirectTo ?? `/sections/${sectionId}`);
};

export default function Section() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Sections</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/sections/${data.id}`}>
              {data.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbItem>Edit</BreadcrumbItem>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Form method="POST">
        <Input name="title" defaultValue={data.title} required />
        <Button type="submit">Save</Button>
      </Form>
    </div>
  );
}
