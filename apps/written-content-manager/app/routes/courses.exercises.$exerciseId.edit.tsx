import type { ExerciseType } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  type MetaFunction,
} from "@remix-run/react";
import { readFileSync } from "fs";
import path from "path";
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
import { Checkbox } from "~/components/ui/checkbox";
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import { p } from "~/db";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import {
  coursesUrl,
  courseUrl,
  editExerciseUrl,
  sectionUrl,
  viewExerciseInVSCodeUrl,
} from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { getVSCodeFiles } from "~/vscode-utils";

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
      deleted: true,
      description: true,
      learningGoal: true,
      readyForRecording: true,
      notes: true,
      type: true,
    },
  });

  const files = await getVSCodeFiles(exerciseId!);

  return {
    ...exercise,
    files: files.map((file) => ({
      path: path.basename(file),
      fullPath: file,
      content: readFileSync(file, "utf-8"),
    })),
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { exerciseId } = params;
  const body = await request.formData();

  const title = body.get("title") as string;
  const description = body.get("description") as string;
  const learningGoal = body.get("learningGoal") as string;
  const notes = body.get("notes") as string;
  const readyForRecording = body.get("readyForRecording") === "on";

  const initialExercise = await p.exercise.findUniqueOrThrow({
    where: {
      id: exerciseId,
    },
    select: {
      readyForRecording: true,
    },
  });

  await p.exercise.update({
    where: {
      id: exerciseId,
    },
    data: {
      title,
      description,
      learningGoal,
      notes,
      readyForRecording,
      type: (body.get("type") ?? "EXPLAINER") as ExerciseType,
    },
  });

  if (
    initialExercise.readyForRecording !== readyForRecording &&
    readyForRecording
  ) {
    await p.analyticsEvent.create({
      data: {
        payload: {
          exerciseId,
        },
        type: "EXERCISE_MARKED_READY_FOR_RECORDING",
      },
    });
  }

  return null;
};

export default function Exercise() {
  const exercise = useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);

  const openInVSCodeFetcher = useFetcher();

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
      {exercise.deleted && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          This exercise has been deleted.
        </div>
      )}
      <Form method="POST" className="space-y-6" ref={formRef}>
        <FormContent>
          <Input
            name="title"
            defaultValue={exercise.title}
            required
            autoFocus
            onChange={handleChange}
          />
          <Combobox
            defaultValue={exercise.type}
            name="type"
            options={[
              {
                value: "EXPLAINER",
                label: "Explainer",
              },
              {
                value: "PROBLEM_SOLUTION",
                label: "Problem/Solution",
              },
            ]}
            onChange={handleChange}
          />
          <Input
            className="col-span-full"
            defaultValue={exercise.learningGoal ?? ""}
            name="learningGoal"
            placeholder="Learning Goal"
            onChange={handleChange}
          ></Input>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              openInVSCodeFetcher.submit(
                {},
                {
                  action: viewExerciseInVSCodeUrl(exercise.id),
                  method: "POST",
                  preventScrollReset: true,
                }
              );
            }}
          >
            Open In VSCode
          </Button>
          <div className="items-center flex justify-center space-x-2">
            <Checkbox
              id="readyForRecording"
              name="readyForRecording"
              onClick={handleChange}
              defaultChecked={exercise.readyForRecording}
            />
            <label htmlFor="readyForRecording" className="text-sm">
              Ready for Recording
            </label>
          </div>
          {exercise.files.map((file) => {
            return (
              <div className="col-span-full">
                <a
                  href={`vscode://file${file.fullPath}`}
                  className="font-mono text-sm mb-2 block"
                >
                  {file.path}
                </a>
                <pre className="p-6 text-xs border-2 border-gray-200">
                  {file.content}
                </pre>
              </div>
            );
          })}
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
      </Form>
    </div>
  );
}
