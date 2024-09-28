import type { CourseType } from "@prisma/client";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";
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

export const meta: MetaFunction = ({}) => {
  return [
    {
      title: `Add Course | WCM`,
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const course = await p.course.create({
    data: {
      title: body.get("title") as string,
      type: body.get("type") as CourseType,
      repoSlug: body.get("repoSlug") as string,
    },
  });

  await p.analyticsEvent.create({
    data: {
      payload: {
        courseId: course.id,
      },
      type: "COURSE_CREATED",
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? courseUrl(course.id));
};

export default function AddCourse() {
  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={coursesUrl()}>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbItem>Add Course</BreadcrumbItem>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Form method="POST">
        <FormContent>
          <Input name="title" placeholder="Title" required autoFocus />
          <Input
            name="repoSlug"
            placeholder="slug"
            defaultValue={""}
            required
          />
          <Input
            name="type"
            placeholder="type"
            defaultValue={"WORKSHOP"}
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
