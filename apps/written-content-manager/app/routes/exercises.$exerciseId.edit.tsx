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
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import { coursesUrl, courseUrl, exerciseUrl, sectionUrl } from "~/routes";

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
      description: true,
      content: true,
    },
  });

  return exercise;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { exerciseId } = params;
  const body = await request.formData();

  const title = body.get("title") as string;
  const description = body.get("description") as string;
  const content = body.get("content") as string;

  await p.exercise.update({
    where: {
      id: exerciseId,
    },
    data: {
      title,
      description,
      content,
    },
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? exerciseUrl(exerciseId as string));
};

export default function Exercise() {
  const exercise = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={coursesUrl()}>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={courseUrl(exercise.section.course.id)}>
              {exercise.section.course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={sectionUrl(exercise.section.id)}>
              {exercise.section.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={exerciseUrl(exercise.id)}>
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
          <LazyLoadedEditor
            className="col-span-full"
            defaultValue={exercise.description}
            name="description"
            language="md"
          ></LazyLoadedEditor>
          <LazyLoadedEditor
            className="col-span-full"
            defaultValue={exercise.content}
            name="content"
            language="ts"
          ></LazyLoadedEditor>
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </div>
  );
}
