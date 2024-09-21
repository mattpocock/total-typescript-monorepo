import type { CourseType } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const title = body.get("title") as string;

  const course = await p.course.create({
    data: {
      title,
      type: body.get("type") as CourseType,
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? `/courses/${course.id}`);
};

export default function AddCourse() {
  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Courses</BreadcrumbLink>
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
