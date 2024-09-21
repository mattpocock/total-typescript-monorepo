import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { FormButtons, FormContent } from "~/components";
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
  const course = await p.section.findUniqueOrThrow({
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

  return course;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const body = await request.formData();

  const title = body.get("title") as string;

  const order = await p.exercise
    .count({
      where: {
        sectionId: params.sectionId!,
      },
    })
    .then((o) => o + 1);

  const section = await p.exercise.create({
    data: {
      title,
      sectionId: params.sectionId!,
      order,
      content: "",
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? `/sections/${section.id}`);
};

export default function Section() {
  const section = useLoaderData<typeof loader>();
  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/courses/${section.course.id}`}>
              {section.course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/sections/${section.id}`}>
              {section.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbItem>Add Exercise</BreadcrumbItem>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Form method="POST">
        <FormContent>
          <Input name="title" placeholder="Title" required autoFocus />
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </div>
  );
}
