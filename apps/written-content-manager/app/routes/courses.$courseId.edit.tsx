import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { FormButtons, FormContent } from "~/components";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { courseUrl } from "~/routes";
import { createFormDataAction } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Edit ${data?.title} | WCM`,
    },
  ];
};

export const action = createFormDataAction(async (json, args) => {
  const course = await serverFunctions.courses.update({
    ...json,
    id: args.params.courseId,
  });

  const redirectTo = new URL(args.request.url).searchParams.get("redirectTo");

  return redirect(redirectTo ?? courseUrl(course.id));
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const course = await serverFunctions.courses.get({
    id: params.courseId!,
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
