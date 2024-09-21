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
  const { exerciseId } = params;
  const exercise = await p.exercise.findUniqueOrThrow({
    where: {
      id: exerciseId,
    },
    select: {
      section: {
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
      },
      id: true,
      title: true,
    },
  });

  return exercise;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { exerciseId } = params;
  const body = await request.formData();

  const title = body.get("title") as string;

  await p.section.update({
    where: {
      id: exerciseId,
    },
    data: {
      title,
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? `/exercises/${exerciseId}`);
};

export default function Section() {
  const exercise = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/courses/${exercise.section.course.id}`}>
              {exercise.section.course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/sections/${exercise.section.id}`}>
              {exercise.section.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/exercises/${exercise.id}`}>
              {exercise.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbItem>Edit</BreadcrumbItem>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Form method="POST" className="space-y-6">
        <FormContent>
          <Input
            name="title"
            defaultValue={exercise.title}
            required
            autoFocus
          />
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </div>
  );
}
