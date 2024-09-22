import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, type MetaFunction } from "@remix-run/react";
import { useRef } from "react";
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
import { coursesUrl, courseUrl, editExerciseUrl, sectionUrl } from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";

export const meta: MetaFunction<typeof loader> = (args) => {
  return [{ title: `${args.data?.title} | WCM` }];
};

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
      learningGoal: true,
      notes: true,
    },
  });

  return exercise;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { exerciseId } = params;
  const body = await request.formData();

  const title = body.get("title") as string;
  const description = body.get("description") as string;
  const learningGoal = body.get("learningGoal") as string;
  const notes = body.get("notes") as string;

  await p.exercise.update({
    where: {
      id: exerciseId,
    },
    data: {
      title,
      description,
      learningGoal,
      notes,
    },
  });

  return null;
};

export default function Exercise() {
  const exercise = useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const fetcher = useFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      replace: true,
      debounceTimeout: 200,
    });
  };

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
            <BreadcrumbLink to={editExerciseUrl(exercise.id)}>
              {exercise.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <fetcher.Form method="POST" className="space-y-6" ref={formRef}>
        <FormContent>
          <Input
            name="title"
            defaultValue={exercise.title}
            required
            autoFocus
            onChange={handleChange}
          />
          <Input
            className="col-span-full"
            defaultValue={exercise.learningGoal ?? ""}
            name="learningGoal"
            placeholder="Learning Goal"
            onChange={handleChange}
          ></Input>
          <LazyLoadedEditor
            label="Notes"
            className="col-span-full"
            defaultValue={exercise.notes}
            name="notes"
            language="md"
            onChange={handleChange}
          ></LazyLoadedEditor>
          <LazyLoadedEditor
            label="Description"
            className="col-span-full"
            defaultValue={exercise.description}
            name="description"
            language="md"
            onChange={handleChange}
          ></LazyLoadedEditor>
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </fetcher.Form>
    </div>
  );
}
