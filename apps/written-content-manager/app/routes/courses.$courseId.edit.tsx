import type { CourseType } from "@prisma/client";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
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
import { coursesUrl, courseUrl } from "~/routes";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Edit ${data?.title} | WCM`,
    },
  ];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const body = await request.formData();

  const course = await p.course.update({
    where: {
      id: params.courseId!,
    },
    data: {
      title: body.get("title") as string,
      type: body.get("type") as CourseType,
      repoSlug: body.get("repoSlug") as string,
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? courseUrl(course.id));
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const course = await p.course.findUniqueOrThrow({
    where: {
      id: params.courseId!,
    },
  });

  return course;
};

export default function AddCourse() {
  const course = useLoaderData<typeof loader>();
  return (
    <div className="space-y-6 flex-col">
      <Form method="POST">
        <FormContent>
          <Input
            name="title"
            placeholder="Title"
            required
            defaultValue={course.title}
            autoFocus
          />
          <Input
            name="repoSlug"
            placeholder="slug"
            defaultValue={course.repoSlug ?? ""}
            required
          />
          <Input
            name="type"
            placeholder="type"
            defaultValue={course.type ?? "WORKSHOP"}
            required
          />
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </div>
  );
}
