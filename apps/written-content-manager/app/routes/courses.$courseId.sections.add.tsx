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
import { coursesUrl, courseUrl, sectionUrl } from "~/routes";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Add Section | WCM`,
    },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { courseId } = params;
  const course = await p.course.findUniqueOrThrow({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  return course;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const body = await request.formData();

  const title = body.get("title") as string;

  const order = await p.section
    .count({
      where: {
        courseId: params.courseId!,
      },
    })
    .then((o) => o + 1);

  const section = await p.section.create({
    data: {
      title,
      courseId: params.courseId!,
      order,
    },
  });

  await p.analyticsEvent.create({
    data: {
      payload: {
        sectionId: section.id,
      },
      type: "SECTION_CREATED",
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? sectionUrl(section.id));
};

export default function Section() {
  const course = useLoaderData<typeof loader>();
  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={courseUrl(course.id)}>
              {course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbItem>Add Section</BreadcrumbItem>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Form method="POST" className="space-y-6">
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
