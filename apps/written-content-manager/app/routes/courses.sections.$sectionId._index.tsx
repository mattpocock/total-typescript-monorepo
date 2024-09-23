import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { FormButtons, FormContent } from "~/components";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { p } from "~/db";
import {
  addExerciseDialogUrl,
  addExerciseUrl,
  coursesUrl,
  courseUrl,
  deleteExerciseUrl,
  editExerciseUrl,
  reorderExercisesUrl,
  sectionUrl,
} from "~/routes";
import { moveElementBack, moveElementForward } from "~/utils";

export const meta: MetaFunction<typeof loader> = (args) => {
  return [{ title: `${args.data?.title} | WCM` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sectionId } = params;
  const section = await p.section.findUniqueOrThrow({
    where: {
      id: sectionId,
    },
    select: {
      id: true,
      title: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      exercises: {
        select: {
          id: true,
          title: true,
          learningGoal: true,
          order: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return section;
};

export default function Section() {
  const section = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const reorderFetcher = useFetcher();

  const [search, setSearch] = useSearchParams();

  const exercises = reorderFetcher.json
    ? (reorderFetcher.json as { id: string }[]).map(({ id }) => {
        return section.exercises.find((exercise) => exercise.id === id)!;
      })
    : section.exercises;

  return (
    <div className="space-y-6 flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={coursesUrl()}>Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={courseUrl(section.course.id)}>
              {section.course.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{section.title}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1>{section.title} Exercises</h1>
      <Table>
        <TableBody>
          {exercises.map((exercise, index) => (
            <TableRow key={exercise.id}>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full size-9 flex justify-center items-center border-2 border-gray-200 ">
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                  <div>
                    <Link
                      to={editExerciseUrl(exercise.id)}
                      className="text-base"
                    >
                      {exercise.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {exercise.learningGoal}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button asChild variant="default">
                    <Link to={editExerciseUrl(exercise.id)}>Edit</Link>
                  </Button>
                  <div>
                    <Button
                      variant="outline"
                      className="rounded-r-none border-r-0"
                      onClick={() => {
                        reorderFetcher.submit(
                          moveElementBack(
                            section.exercises,
                            exercise.id
                          ) satisfies {
                            id: string;
                          }[],
                          {
                            method: "post",
                            action: reorderExercisesUrl(section.id),
                            encType: "application/json",
                            preventScrollReset: true,
                          }
                        );
                      }}
                    >
                      Up
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => {
                        reorderFetcher.submit(
                          moveElementForward(
                            section.exercises,
                            exercise.id
                          ) satisfies {
                            id: string;
                          }[],
                          {
                            method: "post",
                            action: reorderExercisesUrl(section.id),
                            encType: "application/json",
                            preventScrollReset: true,
                          }
                        );
                      }}
                    >
                      Down
                    </Button>
                  </div>

                  <Form
                    action={deleteExerciseUrl(
                      exercise.id,
                      sectionUrl(section.id)
                    )}
                    method="delete"
                  >
                    <Button variant="destructive">Delete</Button>
                  </Form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button asChild>
        <Link to={addExerciseDialogUrl(section.id)}>Add Exercise</Link>
      </Button>
      <Dialog
        open={search.has("add")}
        onOpenChange={(o) => {
          if (!o) {
            navigate(sectionUrl(section.id));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>Add Exercise</DialogHeader>
          <DialogDescription>
            <Form method="POST" action={addExerciseUrl(section.id)}>
              <FormContent>
                <Input name="title" required autoFocus placeholder="Title" />
                <FormButtons>
                  <Button type="submit">Save</Button>
                </FormButtons>
              </FormContent>
            </Form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
