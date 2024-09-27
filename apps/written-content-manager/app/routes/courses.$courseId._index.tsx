import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  EditIcon,
  MicIcon,
  PlusIcon,
  VideoIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { p } from "~/db";
import {
  addSectionUrl,
  coursesUrl,
  courseUrl,
  deleteSectionUrl,
  editSectionUrl,
  reorderSectionsUrl,
  sectionUrl,
} from "~/routes";
import {
  getStatusFromExercise,
  moveElementBack,
  moveElementForward,
} from "~/utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { courseId } = params;
  const course = await p.course.findUniqueOrThrow({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      sections: {
        select: {
          id: true,
          title: true,
          exercises: {
            where: {
              deleted: false,
            },
            select: {
              readyForRecording: true,
              learningGoal: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return course;
};

export default function Course() {
  const course = useLoaderData<typeof loader>();

  const reorderFetcher = useFetcher();
  const sections = reorderFetcher.json
    ? (reorderFetcher.json as { id: string }[]).map(({ id }) => {
        return course.sections.find((s) => s.id === id)!;
      })
    : course.sections;

  const allExercises = sections
    .flatMap((s) => s.exercises)
    .map(getStatusFromExercise);

  const allExercisesReadyForRecording = allExercises.filter(
    (e) => e === "ready-for-recording"
  );

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={coursesUrl()}>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{course.title}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className=" space-y-2">
        <h1>{course.title} Sections</h1>
        <div className="flex items-center space-x-5 text-gray-600 text-sm">
          <div className="flex items-center space-x-2">
            <PlusIcon className="size-4" />
            <span>
              {allExercises.length - allExercisesReadyForRecording.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MicIcon className="size-4" />
            <span>{allExercisesReadyForRecording.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <VideoIcon className="size-4" />
            <span>{0}</span>
          </div>
        </div>
      </div>
      <Table>
        <TableBody>
          {sections.map((section) => {
            const exercisesByStatus = section.exercises.map(
              getStatusFromExercise
            );
            const readyForRecordingExercises = exercisesByStatus.filter(
              (e) => e === "ready-for-recording"
            );
            return (
              <TableRow key={section.id}>
                <TableCell>
                  <Button asChild variant={"link"}>
                    <Link to={sectionUrl(section.id)}>{section.title}</Link>
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-5 text-gray-700">
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
                      >
                        <EditIcon />
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-none border-r-0"
                      onClick={() => {
                        reorderFetcher.submit(
                          moveElementBack(
                            course.sections,
                            section.id
                          ) satisfies {
                            id: string;
                          }[],
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
                          moveElementForward(
                            course.sections,
                            section.id
                          ) satisfies {
                            id: string;
                          }[],
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
      <Button asChild>
        <Link to={addSectionUrl(course.id, courseUrl(course.id))}>
          <PlusIcon />
        </Link>
      </Button>
    </div>
  );
}
