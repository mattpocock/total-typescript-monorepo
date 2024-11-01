import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  MicIcon,
  PlusIcon,
} from "lucide-react";
import { useState } from "react";
import {
  FormButtons,
  FormContent,
  LearningGoalInput,
  TableDescription,
  TitleArea,
  VSCodeIcon,
} from "~/components";
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
import { serverFunctions } from "~/modules/server-functions/server-functions";
import {
  addExerciseDialogUrl,
  addExerciseUrl,
  courseUrl,
  deleteExerciseUrl,
  editExerciseUrl,
  generateNextExerciseUrl,
  reorderExercisesUrl,
  sectionUrl,
} from "~/routes";
import { useVSCode } from "~/use-open-in-vscode";
import {
  getHumanReadableStatusFromExercise,
  moveElementBack,
  moveElementForward,
} from "~/utils";

export const meta: MetaFunction<typeof loader> = (args) => {
  return [{ title: `${args.data?.title} | WCM` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sectionId } = params;
  return serverFunctions.sections.get({ id: sectionId! });
};

export default function Section() {
  const section = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const reorderFetcher = useFetcher();
  const exercises = reorderFetcher.json
    ? (reorderFetcher.json as { id: string }[]).map(({ id }) => {
        return section.exercises.find((exercise) => exercise.id === id)!;
      })
    : section.exercises;

  const [search, setSearch] = useSearchParams();

  const vscode = useVSCode();

  const generateNextExerciseFetcher = useFetcher();

  return (
    <div className="space-y-8 flex-col">
      <TitleArea
        title={section.title}
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink to={courseUrl(section.course.id)}>
                  {section.course.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{section.title}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <Table>
        <TableBody>
          {exercises.map((exercise, index) => {
            const status = getHumanReadableStatusFromExercise(exercise);
            return (
              <TableRow key={exercise.id}>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full size-9 flex justify-center items-center border-2 border-gray-200 flex-shrink-0">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                    <div>
                      <Link
                        to={editExerciseUrl(exercise.id)}
                        className="text-base"
                        prefetch="intent"
                      >
                        <h2>{exercise.title}</h2>
                        <TableDescription>
                          {exercise.learningGoal}
                        </TableDescription>
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {exercise.audioRecordingCreated ? <MicIcon /> : null}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex justify-start">
                    <div
                      className={`px-3 py-1 text-xs uppercase rounded-lg flex justify-center items-center flex-shrink-0 ${
                        status.value === "needs-learning-goal"
                          ? "bg-red-100 text-red-800"
                          : status.value === "ready-for-recording"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {status.label}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button
                      variant="secondary"
                      className="rounded-r-none flex items-center justify-center shrink-0"
                      onClick={() => {
                        vscode.openExercise(exercise.id);
                      }}
                    >
                      <VSCodeIcon className="size-5 " />
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-none border-r-0 shrink-0"
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
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-none border-l-0 shrink-0"
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
                      <ArrowDownIcon />
                    </Button>

                    <Form
                      action={deleteExerciseUrl(
                        exercise.id,
                        sectionUrl(section.id)
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
          <Link to={addExerciseDialogUrl(section.id)} prefetch="intent">
            <PlusIcon />
          </Link>
        </Button>
        <Button
          onClick={() => {
            generateNextExerciseFetcher.submit(null, {
              method: "post",
              action: generateNextExerciseUrl(section.id),
            });
          }}
        >
          Generate Next Exercise
        </Button>
      </div>
      <AddExerciseDialog
        open={search.has("add")}
        sectionId={section.id}
        section={section}
      />
    </div>
  );
}

const AddExerciseDialog = (props: {
  sectionId: string;
  open: boolean;
  section: {
    title: string;
    course: { title: string };
  };
}) => {
  const navigate = useNavigate();
  const [exerciseTitle, setExerciseTitle] = useState("");
  return (
    <Dialog
      open={props.open}
      onOpenChange={(o) => {
        if (!o) {
          navigate(sectionUrl(props.sectionId));
        }
      }}
    >
      <DialogContent>
        <DialogHeader>Add Exercise</DialogHeader>
        <DialogDescription>
          <Form
            method="POST"
            action={addExerciseUrl(
              props.sectionId,
              sectionUrl(props.sectionId)
            )}
          >
            <FormContent>
              <Input
                name="title"
                required
                autoFocus
                placeholder="Title"
                className="col-span-full"
                onChange={(e) => setExerciseTitle(e.target.value)}
              />
              <LearningGoalInput
                defaultValue={""}
                exercise={{
                  title: exerciseTitle,
                  section: props.section,
                }}
              />
              <FormButtons>
                <Button type="submit">Save</Button>
              </FormButtons>
            </FormContent>
          </Form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
