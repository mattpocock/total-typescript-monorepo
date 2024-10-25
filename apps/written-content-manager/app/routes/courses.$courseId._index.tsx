import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  EditIcon,
  MicIcon,
  PlusIcon,
  VideoIcon,
} from "lucide-react";
import { format, isToday } from "date-fns";
import { PageContent, TitleArea } from "~/components";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import {
  addSectionUrl,
  courseUrl,
  deleteSectionUrl,
  editSectionUrl,
  printCourseToRepoUrl,
  reorderSectionsUrl,
  sectionUrl,
  syncRepoToExercisePlaygroundUrl,
} from "~/routes";
import {
  getStatusFromExercise,
  moveElementBack,
  moveElementForward,
} from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.title} | WCM`,
    },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return serverFunctions.courses.get({ id: params.courseId! });
};

export default function Course() {
  const course = useLoaderData<typeof loader>();

  const reorderFetcher = useFetcher();
  const sections = reorderFetcher.json
    ? (reorderFetcher.json as string[]).map((id) => {
        return course.sections.find((s) => s.id === id)!;
      })
    : course.sections;

  const allExercises = sections
    .flatMap((s) => s.exercises)
    .map(getStatusFromExercise);

  const allExercisesReadyForRecording = allExercises.filter(
    (e) => e === "ready-for-recording"
  );

  const printToRepoFetcher = useFetcher();

  return (
    <PageContent>
      <TitleArea
        title={`${course.title} Sections`}
        underTitle={
          <div className="flex items-center space-x-5 text-gray-600 dark:text-gray-300 text-sm">
            <div className="flex items-center space-x-2">
              <PlusIcon className="size-4" />
              <span>
                {allExercises.length > 0
                  ? `${(
                      ((allExercises.length -
                        allExercisesReadyForRecording.length) /
                        allExercises.length) *
                      100
                    ).toFixed(0)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MicIcon className="size-4" />
              <span>
                {allExercises.length > 0
                  ? `${(
                      (allExercisesReadyForRecording.length /
                        allExercises.length) *
                      100
                    ).toFixed(0)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <VideoIcon className="size-4" />
              <span>0%</span>
            </div>
          </div>
        }
      ></TitleArea>
      <Table>
        <TableBody>
          {sections.map((section, index) => {
            const exercisesByStatus = section.exercises.map(
              getStatusFromExercise
            );
            const readyForRecordingExercises = exercisesByStatus.filter(
              (e) => e === "ready-for-recording"
            );
            return (
              <TableRow key={section.id}>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full size-9 flex justify-center items-center border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                    <div>
                      <Link
                        to={sectionUrl(section.id)}
                        className="text-base"
                        prefetch="intent"
                      >
                        {section.title}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-5">
                    <div className="flex items-center space-x-1">
                      <PlusIcon className="size-4" />
                      <span>
                        {exercisesByStatus.length -
                          readyForRecordingExercises.length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MicIcon className="size-4" />
                      <span>{readyForRecordingExercises.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <VideoIcon className="size-4" />
                      <span>{0}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button asChild className="rounded-r-none">
                      <Link
                        to={editSectionUrl(section.id, courseUrl(course.id))}
                        prefetch="intent"
                      >
                        <EditIcon />
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-none border-r-0"
                      onClick={() => {
                        reorderFetcher.submit(
                          moveElementBack(course.sections, section.id).map(
                            (a) => a.id
                          ) satisfies string[],
                          {
                            method: "post",
                            action: reorderSectionsUrl(course.id),
                            encType: "application/json",
                            preventScrollReset: true,
                          }
                        );
                      }}
                    >
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-none border-l-0"
                      onClick={() => {
                        reorderFetcher.submit(
                          moveElementForward(course.sections, section.id).map(
                            (a) => a.id
                          ) satisfies string[],
                          {
                            method: "post",
                            action: reorderSectionsUrl(course.id),
                            encType: "application/json",
                            preventScrollReset: true,
                          }
                        );
                      }}
                    >
                      <ArrowDownIcon />
                    </Button>
                    <Form
                      action={deleteSectionUrl(
                        section.id,
                        courseUrl(course.id)
                      )}
                      method="delete"
                    >
                      <Button variant="secondary" className="rounded-l-none">
                        <DeleteIcon />
                      </Button>
                    </Form>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex items-center space-x-4">
        <Button asChild>
          <Link
            to={addSectionUrl(course.id, courseUrl(course.id))}
            prefetch="intent"
          >
            <PlusIcon />
          </Link>
        </Button>

        <Form method="post" action={syncRepoToExercisePlaygroundUrl(course.id)}>
          <Button>Sync Repo To Playground</Button>
        </Form>
        <Button
          onClick={() => {
            printToRepoFetcher.submit(null, {
              action: printCourseToRepoUrl(course.id),
              method: "post",
            });
          }}
        >
          Print To Repo{" "}
        </Button>
        <span className="text-sm">
          {course.lastPrintedToRepoAt
            ? isToday(course.lastPrintedToRepoAt)
              ? `Last Printed ${format(course.lastPrintedToRepoAt, "HH:mm")}`
              : `Last Printed ${format(course.lastPrintedToRepoAt, "MM/dd/yyyy")}`
            : "Never Printed"}
        </span>
      </div>
    </PageContent>
  );
}
