import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  type MetaFunction,
} from "@remix-run/react";
import clsx from "clsx";
import { readFileSync } from "fs";
import { DeleteIcon, PlayIcon, SquareIcon } from "lucide-react";
import path from "path";
import { useEffect, useRef, useState } from "react";
import { AudioRecorder } from "~/audio-recorder";
import { FormButtons, FormContent, PageContent, TitleArea } from "~/components";
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
import { LazyLoadedEditor } from "~/monaco-editor/lazy-loaded-editor";
import {
  courseUrl,
  editExerciseUrl,
  exerciseAudioUrl,
  exerciseDeleteAudioUrl,
  exerciseUploadAudioUrl,
  sectionUrl,
} from "~/routes";
import { useDebounceFetcher } from "~/use-debounced-fetcher";
import { useVSCode } from "~/use-open-in-vscode";
import {
  getDoesAudioExistForExercise,
  getVSCodeFilesForExercise,
} from "~/vscode-utils";

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
      audioTranscript: true,
      readyForRecording: true,
      notes: true,
    },
  });

  const files = await getVSCodeFilesForExercise(exerciseId!);

  const audioExists = await getDoesAudioExistForExercise(exerciseId!);

  return {
    ...exercise,
    files: files.map((file) => ({
      path: path.basename(file),
      fullPath: file,
      content: readFileSync(file, "utf-8"),
    })),
    audioExists,
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
  const exercise = useLoaderData<typeof loader>();

  const debouncedFetcher = useDebounceFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleChange = () => {
    debouncedFetcher.debounceSubmit(formRef.current, {
      replace: true,
      debounceTimeout: 200,
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
        navigate(window.location.pathname, {
          replace: true,
        });
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
  }, [isAudioPlaying]);

  const deleteAudioFetcher = useFetcher();

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
          <Input
            className="col-span-full"
            defaultValue={exercise.learningGoal ?? ""}
            name="learningGoal"
            placeholder="Learning Goal"
            onChange={handleChange}
          ></Input>
          {exercise.files.length > 0 && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                vscode.openExercise(exercise.id);
              }}
            >
              <img src="/vscode-alt.svg" className="size-5 mr-3" />
              Open
            </Button>
          )}
          {exercise.files.length === 0 && (
            <div className="grid grid-cols-2 col-span-full gap-4">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  vscode.createProblemSolution(exercise.id);
                }}
              >
                <img src="/vscode-alt.svg" className="size-5 mr-3" />
                Create Problem/Solution Files
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  vscode.createExplainer(exercise.id);
                }}
              >
                <img src="/vscode-alt.svg" className="size-5 mr-3" />
                Create Explainer File
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  vscode.copyPreviousExerciseFiles(exercise.id);
                }}
              >
                <img src="/vscode-alt.svg" className="size-5 mr-3" />
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
    </PageContent>
  );
}
