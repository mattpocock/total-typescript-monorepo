import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  type MetaFunction,
} from "@remix-run/react";
import clsx from "clsx";
import { DeleteIcon, PlayIcon, SquareIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioRecorder } from "~/audio-recorder";
import { useOnPageActions } from "~/command-palette";
import {
  FormButtons,
  FormContent,
  LearningGoalInput,
  PageContent,
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
import { Button, buttonVariants } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { p } from "~/db";
import { serverFunctions } from "~/modules/server-functions/server-functions";
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import {
  courseUrl,
  editExerciseUrl,
  exerciseAudioUrl,
  exerciseDeleteAudioUrl,
  exerciseUploadAudioUrl,
  getLearningGoalUrl,
  sectionUrl,
} from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { useVSCode } from "~/use-open-in-vscode";

export const meta: MetaFunction<typeof loader> = (args) => {
  return [{ title: `${args.data?.exercise.title} | WCM` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { exerciseId } = params;
  const exercise = await serverFunctions.exercises.get({
    id: exerciseId!,
  });

  const [
    prevExercise,
    nextExercise,
    lastExerciseInPrevSection,
    firstExerciseInNextSection,
  ] = await p.$transaction([
    p.exercise.findFirst({
      where: {
        deleted: false,
        title: {
          not: "",
        },
        sectionId: exercise.section.id,
        order: {
          lt: exercise.order,
        },
      },
      orderBy: {
        order: "desc",
      },
      select: {
        id: true,
        title: true,
      },
    }),
    p.exercise.findFirst({
      where: {
        deleted: false,
        title: {
          not: "",
        },
        sectionId: exercise.section.id,
        order: {
          gt: exercise.order,
        },
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        title: true,
      },
    }),
    p.exercise.findFirst({
      where: {
        deleted: false,
        title: {
          not: "",
        },
        section: {
          courseId: exercise.section.course.id,
          order: {
            lt: exercise.section.order,
          },
        },
      },
      orderBy: [
        {
          section: {
            order: "desc",
          },
        },
        {
          order: "desc",
        },
      ],
      select: {
        id: true,
        title: true,
      },
    }),
    p.exercise.findFirst({
      where: {
        deleted: false,
        title: {
          not: "",
        },
        section: {
          courseId: exercise.section.course.id,
          order: {
            gt: exercise.section.order,
          },
        },
      },
      orderBy: [
        {
          section: {
            order: "asc",
          },
        },
        {
          order: "asc",
        },
      ],
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  return {
    exercise,
    prevExercise: prevExercise ?? lastExerciseInPrevSection,
    nextExercise: nextExercise ?? firstExerciseInNextSection,
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
  const { exercise, prevExercise, nextExercise } =
    useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      debounceTimeout: 200,
      preventScrollReset: true,
    });
  };

  const vscode = useVSCode();

  const navigate = useNavigate();

  const uploadAudio = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    fetch(exerciseUploadAudioUrl(exercise.id), {
      method: "post",
      body: formData,
    }).then((res) => {
      if (res.ok) {
        navigate(window.location.pathname);
      } else {
        alert("Upload failed!");
      }
    });
  };

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.playbackRate = 2;
      audioRef.current.play();

      audioRef.current.addEventListener(
        "ended",
        () => {
          setIsAudioPlaying(false);
        },
        { signal: abortController.signal }
      );
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      abortController.abort();
    };
  }, [isAudioPlaying, audioRef.current]);

  const deleteAudioFetcher = useFetcher();

  useOnPageActions(
    useMemo(() => {
      return [
        nextExercise && {
          label: "Go To Next Exercise",
          action: () => {
            navigate(editExerciseUrl(nextExercise.id));
          },
        },
        prevExercise && {
          label: "Go To Previous Exercise",
          action: () => {
            navigate(editExerciseUrl(prevExercise.id));
          },
        },
      ].filter((e) => !!e);
    }, [prevExercise, nextExercise])
  );

  return (
    <PageContent>
      <TitleArea
        title={exercise.title}
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
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
        }
      />
      {exercise.deleted && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          This exercise has been deleted.
        </div>
      )}
      <Form method="POST" ref={formRef}>
        <FormContent>
          <Input
            name="title"
            defaultValue={exercise.title}
            className="col-span-full"
            required
            autoFocus
            onChange={handleChange}
          />
          <LearningGoalInput
            defaultValue={exercise.learningGoal}
            exercise={exercise}
            handleChange={handleChange}
          />
          {exercise.files.length > 0 && (
            <Button
              variant="secondary"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                vscode.openExercise(exercise.id);
              }}
            >
              <VSCodeIcon className="size-5 mr-3" />
              Open
            </Button>
          )}
          {exercise.files.length === 0 && (
            <div className="grid grid-cols-2 col-span-full gap-4">
              <Button
                variant="secondary"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  vscode.createProblemSolution(exercise.id);
                }}
              >
                <VSCodeIcon className="size-5 mr-3" />
                Create Problem/Solution Files
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  vscode.createExplainer(exercise.id);
                }}
              >
                <VSCodeIcon className="size-5 mr-3" />
                Create Explainer File
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  vscode.copyPreviousExerciseFiles(exercise.id);
                }}
              >
                <VSCodeIcon className="size-5 mr-3" />
                Copy Previous Exercise
              </Button>
            </div>
          )}
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
          <div className="grid grid-flow-col">
            {exercise.audioExists ? (
              <>
                <audio
                  src={exerciseAudioUrl(exercise.id)}
                  ref={audioRef}
                  className="hidden"
                ></audio>
                <Button
                  onClick={() => {
                    setIsAudioPlaying(!isAudioPlaying);
                  }}
                  className="flex items-center space-x-3 rounded-r-none"
                >
                  {isAudioPlaying ? (
                    <SquareIcon className="size-5" fill="white" />
                  ) : (
                    <PlayIcon className="size-5" fill="white" />
                  )}
                  <span className="font-mono">audio.mkv</span>
                </Button>
                <Button
                  className="rounded-none"
                  variant={"secondary"}
                  type="button"
                  onClick={() => {
                    deleteAudioFetcher.submit(null, {
                      method: "POST",
                      action: exerciseDeleteAudioUrl(exercise.id),
                    });
                  }}
                >
                  <DeleteIcon />
                </Button>
              </>
            ) : (
              <>
                <div
                  className={buttonVariants({
                    variant: "secondary",
                    className: clsx("rounded-r-none w-full"),
                  })}
                >
                  No Audio
                </div>
                <Button asChild className="rounded-l-none" type="button">
                  {/* {uploadAudioFetcher.state === "submitting" ? (
                    <button>Uploading...</button>
                  ) : ( */}
                  <AudioRecorder onComplete={uploadAudio} />
                  {/* )} */}
                </Button>
              </>
            )}
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
          {exercise.audioTranscript && (
            <div className="col-span-full text-sm leading-6">
              {exercise.audioTranscript.split("\n").map((para) => {
                return <p key={para}>{para}</p>;
              })}
            </div>
          )}
          <LazyLoadedEditor
            label="Notes"
            className="col-span-full"
            defaultValue={exercise.notes}
            name="notes"
            language="md"
            onChange={handleChange}
          ></LazyLoadedEditor>
          <FormButtons>
            <Button type="submit">Save</Button>
          </FormButtons>
        </FormContent>
      </Form>
    </PageContent>
  );
}
